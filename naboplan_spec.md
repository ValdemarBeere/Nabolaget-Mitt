# NaboPlan — Produktspesifikasjon for Claude Code

**Versjon:** 1.0  
**Prosjekt:** EiT TDT4857 NTNU 2025  
**Formål:** AI-støttet medvirkning i norsk byplanlegging — utvidelse av arealplaner.no  

---

## 1. Overordnet beskrivelse

NaboPlan er en nettjeneste som gjør det enklere for innbyggere, kommuneansatte, politikere og organisasjoner å delta i og forstå norske planprosesser. Tjenesten henter plandata fra arealplaner.no (Kartverket) og bruker Claude API som RAG-modell for å forklare planforslag på vanlig norsk og hjelpe brukere å formulere merknader.

---

## 2. Tech stack

### Frontend
- **React** (Vite eller Create React App)
- **Tailwind CSS** for styling
- **React Router** for klientsideruting
- **Axios** for API-kall mot backend

### Backend
- **Spring Boot** (Java 17+)
- **Maven** for avhengighetsstyring
- **Spring Data JPA** for databaselag
- **Spring Security** for autentisering
- **PostgreSQL** som database

### Integrasjoner
- **Geonorge Plandata WFS** — henter plandata som vektordata via WFS-protokoll (OGC-standard). Åpen og gratis, ingen API-nøkkel nødvendig. Backend parser GML/XML og eksponerer JSON til frontend.
- **Kartverket Adresse-API** (`ws.geonorge.no/adresser/v1/`) — adresse til koordinater. Åpent REST-API, ingen nøkkel.
- **Anthropic Claude API** — chatbot og merknadshjelp (RAG med plandata som kontekst)
- **SendGrid eller tilsvarende** — e-postvarsling

### Kjøremiljø
- Backend: JAR-fil, kjørbar lokalt på localhost:8080
- Frontend: kjørbar lokalt på localhost:3000
- PostgreSQL: lokal instans eller Docker

---

## 3. Autentisering og innlogging

### Strategi: Ingen innlogging — e-post kun for varsler

Tjenesten er fullstendig åpen. Det kreves INGEN innlogging eller konto for noe som helst.

E-post oppgis kun i ett tilfelle:
- Varslingspåmelding: bruker ønsker e-post neste gang en plan starter i nabolaget

E-post lagres da direkte med koordinatene — ingen brukerøkt, ingen JWT, ingen autentisering.

Merknadsskriver fungerer uten konto. Bruker kan oppgi e-post for å motta kvittering, men det er valgfritt og skaper ikke en konto.

### Konsekvenser for backend
- Fjern Spring Security helt (unødvendig kompleksitet)
- Ingen JWT, ingen token-tabell, ingen auth-endepunkter
- `subscriptions`-tabellen knyttes direkte til e-post, ikke til en user-id

### Databaser: Forenklet modell
```
subscriptions: id, email, label, lat, lng, radius_km, created_at
merknader: id, email (nullable), plan_id, plan_navn, tekst, temaer[], created_at
plan_cache: plan_id, data (JSONB), cached_at, expires_at
chat_log: id, plan_id, session_id, message, response, created_at
```

---

## 4. Sider og ruter

### 4.1 Forside — `/`

**Formål:** Inngang til tjenesten. Presenterer Nyhavna som det aktive planprosjektet.

**Innhold:**
- Header: "Nyhavna, Trondheim — din stemme teller"
- Statusboks: planens navn, status (høring/oppstart/vedtatt), høringsfrist med nedtelling
- Tre kort: "Hva er planlagt?", "Spør om planen", "Si din mening"
- Kort om hva medvirkning betyr og hvorfor det er viktig
- Primærknapp: "Forstå planen" → `/plan`
- Sekundærknapp: "Send merknad" → `/merknad`

**Ingen søkefelt** — tjenesten er dedikert til Nyhavna i denne prototypen.

---

### 4.2 Planresultater — FJERNET

Siden det kun er én plan (Nyhavna), er det ingen planlisteside. Forsiden lenker direkte til plandetaljsiden.

---

### 4.3 Plandetalj med chatbot — `/plan/{planid}`

**Formål:** La bruker forstå ett konkret planforslag ved hjelp av AI-forklaring og chatbot.

**Innhold:**

**Venstre spalte (60%):**
- Plannavn, planid, kommune, dato
- Status-badge med frist hvis relevant
- AI-generert oppsummering (3-5 setninger på vanlig norsk):
  - "Dette planforslaget gjelder..." 
  - "De viktigste endringene er..."
  - "Dette kan bety for deg som bor i nærheten..."
- Nøkkeltall-kort: Maks etasjer / Utnyttelsesgrad / Areal / Plantype
- Knapp: "Les det originale plandokumentet" → lenke til arealplaner.no
- Knapp: "Send merknad" → `/merknad/{planid}`

**Høyre spalte (40%):**
- Chatbot-grensesnitt
  - Header: "Spør om denne planen"
  - Velkomstmelding: "Jeg kan forklare hva {plannavn} betyr for deg. Hva lurer du på?"
  - Forslagschips ved oppstart: "Hva betyr utnyttelsesgrad?", "Vil dette skygge for meg?", "Kan jeg stoppe dette?", "Hva skjer etter høringen?"
  - Meldingsinput med send-knapp
  - Chathistorikk i sesjonen (ikke lagret til database)

**Chatbot-logikk:**
```
Hvis Claude API er tilgjengelig:
  → Send plandata (planbeskrivelse, bestemmelser) som system-kontekst
  → Send brukers spørsmål
  → Stream svar tilbake til frontend
  
Hvis Claude API ikke tilgjengelig (fallback):
  → Match spørsmål mot forhåndsdefinerte nøkkelord
  → Returner predefinert svar for vanligste spørsmål
```

**API-kall:**
- `GET /api/plan` → returnerer hardkodet Nyhavna-plandata
- `POST /api/chat` med body `{message, history[]}` → returnerer AI-svar (streaming)

---

### 4.4 Merknadsskriver — `/merknad`

**Formål:** Hjelpe bruker å formulere og sende en høringmerknad som kommunen faktisk kan behandle.

**Tilgjengelighet:** Alltid tilgjengelig for Nyhavna-planen.

**Steg 1 — Velg tema (ikke innlogging nødvendig ennå):**
- Overskrift: "Hva er du bekymret for?"
- Klikkbare temaer: Sol og skygge / Trafikk og parkering / Byggehøyde / Grøntareal / Innsyn og privatliv / Støy / Annet
- Velg ett eller flere. Fortsett-knapp.

**Steg 2 — Beskriv bekymringen:**
- Fritekstfelt: "Beskriv med egne ord hva du er bekymret for"
- Veiledende tekst under: "Du trenger ikke bruke fagtermer. Skriv hva du tenker."
- AI-knapp: "Hjelp meg å formulere dette" → kaller Claude API med valgt tema + fritekst → genererer utkast til merknad
- Bruker kan redigere AI-forslaget fritt

**Steg 3 — Ferdig merknad:**
- Viser ferdig formulert merknad i redigerbart tekstfelt
- Merknaden inkluderer automatisk: planid, plannavn, saksnummer
- AI har sørget for at merknaden refererer til relevante planbestemmelser
- Knapp: "Kopier merknad" (til clipboard)
- Knapp: "Send direkte" (åpner kommunens høringsskjema i ny fane)
- Boks: "Vil du lagre og følge denne merknaden?"
  - Input: e-post
  - Knapp: "Lagre og motta bekreftelse"
  - Forklaring: "Vi sender deg en e-post når kommunen har behandlet høringen"

**Steg 4 — Kvittering (etter e-post er oppgitt):**
- "Din merknad er lagret"
- "Hva skjer videre": tydelig beskrivelse av prosessen etter høringsfrist
- "Kommunen er forpliktet til å vurdere og svare på alle merknader"
- Knapp: "Gå tilbake til planen"

**API-kall:**
- `POST /api/merknad/generer` med body `{planid, temaer[], fritekst}` → returnerer AI-formulert merknadsutkast
- `POST /api/merknad/lagre` med body `{planid, tekst, email}` → lagrer i DB og sender magic link til bruker

---

### 4.5 Minside / Dashboard — FJERNET

Ingen minside. Siden det ikke er innlogging, er det ingen personlig dashboardside. Varslingspåmeldinger bekreftes via e-post med avmeldingslenke.

---

### 4.6 Politiker-/saksbehandler-visning — `/admin`

**Tilgang:** Ingen innlogging (prototype), eventuelt en enkel admin-flag på bruker

**Formål:** Gir kommuneansatte og politikere et annet bilde av samme plan — fokus på merknadsoversikt.

**Innhold:**
- Statistikkrad: Totalt antall merknader / Antall temaer / Geografisk distribusjon
- Tematisk gruppering av merknader (AI-kategorisert): "Sol og skygge (23)", "Trafikk (14)", etc.
- For hvert tema: liste over merknader med AI-sammendrag øverst
- Kart: punkter for hvem som har sendt merknad (ingen persondata, kun posisjon fra adresse)
- Eksport-knapp: "Last ned merknadsliste som PDF"

**API-kall:**
- `GET /api/plan/{planid}/merknader` → henter og kategoriserer lagrede merknader
- `POST /api/plan/{planid}/oppsummering` → Claude API lager tematisk sammendrag

---

### 4.7 Om tjenesten — `/om`

**Innhold:**
- Hva er NaboPlan? (kort)
- Hvem er det for? (de 5 aktørgruppene kort beskrevet)
- Slik fungerer planprosessen (komprimert versjon av A1-C5 tidslinjen)
- Personvern og databehandling
- Kontakt / feedback-skjema

---

### 4.8 404 og feilsider

- 404: Vennlig side med søkefelt
- Plan ikke funnet: Forklaring + lenke til arealplaner.no direkte
- API-feil: Brukervennlig melding + fallback til mock-data

---

## 5. Backend API-endepunkter (Spring Boot)

### Planer
```
GET  /api/plan                          → Returnerer Nyhavna-plandata (hardkodet JSON)
GET  /api/plan/dokumenter               → Liste over tilgjengelige plandokumenter
GET  /api/plan/merknader                → Kategoriserte merknader (lagret i DB)
```

### Chatbot
```
POST /api/chat                          → Claude API med plandata som kontekst
     Body: { planid, message, history[] }
     Response: streaming tekst
```

### Merknader
```
POST /api/merknad/generer               → Claude API genererer merknadsutkast
     Body: { planid, temaer[], fritekst }
POST /api/merknad/lagre                 → Lagrer merknad + sender magic link
     Body: { planid, tekst, email }
```

### Autentisering
```
POST /api/subscriptions                 → Lagre varslingspåmelding (e-post + koordinater)
     Body: { email, label, lat, lng, radius_km }
DELETE /api/subscriptions/{id}          → Slett varsling (via avmeldingslenke i e-post)
```

### Ingen /api/auth eller /api/user endepunkter — tjenesten er åpen for alle.

### Admin
```
GET  /api/plan/{planid}/admin           → Statistikk og kategorisering for kommuneansatt
POST /api/plan/{planid}/oppsummering    → Claude API-generert tematisk sammendrag
```

---

## 6. Databasemodell (PostgreSQL)

Enkel modell — ingen plan-cache nødvendig siden plandata er hardkodet.

```sql
-- Varslingspåmeldinger
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  label VARCHAR(255),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_km INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Lagrede merknader
CREATE TABLE merknader (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255),
  plan_id VARCHAR(100) NOT NULL DEFAULT 'nyhavna-2024',
  tekst TEXT NOT NULL,
  temaer TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chatlogg (valgfritt)
CREATE TABLE chat_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(100),
  message TEXT,
  response TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 7. Claude API — RAG-oppsett

### System-prompt for chatbot
```
Du er en planassistent som hjelper norske innbyggere å forstå reguleringsplaner. 
Du svarer alltid på norsk og bruker aldri planfaglige fagtermer uten å forklare dem. 
Svar skal være korte og konkrete (2-4 setninger). 

Kontekst for denne samtalen:
Plan: {plannavn} ({planid})
Kommune: {kommune}
Status: {status}
Høringsfrist: {frist}

Planinnhold:
{planbeskrivelse truncated til 4000 tokens}
{planbestemmelser truncated til 2000 tokens}

Du kan bare svare på spørsmål om denne planen. 
Hvis du ikke vet svaret, si det ærlig og foreslå at brukeren leser originaldokumentet.
```

### Fallback mock-svar
Definer minst 10 nøkkelord-mappinger for vanlige spørsmål:
- "utnyttelsesgrad" → forklaring
- "skygge" / "sol" → standardsvar om skyggeanalyse
- "klage" / "stoppe" → svar om medvirkningsprosessen
- "høring" / "merknad" → forklaring av prosessen
- "BRA" / "m²" → forklaring av arealberegning

---

## 8. Datagrunnlag — Nyhavna, Trondheim

### Strategi
I stedet for ekstern API-integrasjon lastes plandata opp manuelt som dokumenter. Prototypen fokuserer på **ett konkret planprosjekt: Nyhavna i Trondheim**. Dette gir full kontroll over datakvalitet og gjør Claude API-integrasjonen (RAG) enkel og forutsigbar.

### Dokumenter å laste opp
Hent følgende fra Trondheim kommunes planportal (innsyn.trondheim.kommune.no) eller arealplaner.no:

```
/backend/src/main/resources/plandata/nyhavna/
  planbeskrivelse.pdf
  planbestemmelser.pdf
  plankart.pdf
  saksfremlegg.pdf
  høringsbrev.pdf          (hvis relevant)
  merknadsliste.pdf        (hvis relevant)
```

### Hardkodet planinfo (én plan, ingen database-oppslagsnødvendig)
```json
{
  "planId": "nyhavna-2024",
  "plannavn": "Områderegulering for Nyhavna",
  "kommune": "Trondheim",
  "kommunenummer": "5001",
  "status": "høring",
  "høringsfrist": "2025-04-30",
  "plantype": "Områderegulering",
  "adresse": "Nyhavna, Trondheim",
  "lat": 63.4420,
  "lng": 10.4180,
  "beskrivelse": "Områderegulering for Nyhavna omfatter transformasjon av tidligere industriområde til blandet by...",
  "dokumenter": [
    { "navn": "Planbeskrivelse", "fil": "planbeskrivelse.pdf" },
    { "navn": "Planbestemmelser", "fil": "planbestemmelser.pdf" },
    { "navn": "Plankart", "fil": "plankart.pdf" }
  ]
}
```

### RAG-oppsett i backend
Ved oppstart laster Spring Boot inn PDF-dokumentene, ekstraherer tekst (Apache PDFBox), og holder innholdet i minne som kontekst for Claude API.

```java
// PDF-tekst ekstraktion ved oppstart
@Component
public class PlanDocumentLoader {
    @PostConstruct
    public void load() {
        // Les alle PDF-er fra /resources/plandata/nyhavna/
        // Ekstraher tekst med Apache PDFBox
        // Lagre som strukturert kontekst for Claude API
    }
}
```

```xml
<!-- pom.xml -->
<dependency>
  <groupId>org.apache.pdfbox</groupId>
  <artifactId>pdfbox</artifactId>
  <version>3.0.x</version>
</dependency>
```

### Claude API system-prompt med dokumentkontekst
```
Du er en planassistent for Nyhavna i Trondheim.
Du svarer alltid på norsk og bruker aldri planfaglige fagtermer uten å forklare dem.
Svar skal være korte og konkrete (2-4 setninger).

Her er planmaterialet for Nyhavna:

[PLANBESKRIVELSE]
{innhold fra planbeskrivelse.pdf, truncated til 4000 tokens}

[PLANBESTEMMELSER]
{innhold fra planbestemmelser.pdf, truncated til 2000 tokens}

Svar kun basert på dette materialet.
Hvis du ikke finner svaret i dokumentene, si det ærlig.
```

---

## 9. Frontend-komponenter (React)

### Globalt
- `<Navbar>` — logo + lenker til Hjem, Om, Minside (viser innlogget-status)
- `<Footer>` — lenker, personvern, kontakt
- `<PlanBadge status="høring|oppstart|vedtatt" frist="2025-04-14" />` — fargekodet status
- `<DemoMerknad>` — synlig banner når mock-data brukes

### Forside
- `<AddressSearch>` — søkefelt med autocomplete
- `<HowItWorks>` — tre-kolonne forklaringsseksjon
- `<ProcessTimeline>` — enkel visuell tidslinje over planprosessen

### Planresultater
- `<PlanList plans={[]} />` — liste med filterknapper
- `<PlanCard plan={} />` — enkelt plankort med status, frist, knapper
- `<MapView plans={[]} center={} />` — kartvisning (Leaflet)
- `<SubscribeForm lat lng />` — e-postskjema for varsling

### Plandetalj
- `<PlanSummary plan={} />` — AI-generert oppsummering + nøkkeltall
- `<Chatbot planId={} />` — chatgrensesnitt med suggestions og streaming
- `<ChatMessage role="user|assistant" content={} />` — enkeltmelding

### Merknadsskriver
- `<ThemeSelector themes={[]} onChange={} />` — klikkbare tema-chips
- `<MerknadEditor initial="" onChange={} />` — redigerbart tekstfelt
- `<AIHelper onGenerate={} loading={} />` — AI-formulering-knapp
- `<SubmitForm planId email onSubmit />` — e-post + bekreftelsesflyt

### Admin-visning
- `<MerknadStats total themes />` — statistikkrad
- `<ThemeGroup theme merknader />` — grupperte merknader per tema
- `<MerknadMap merknader />` — kart med posisjoner

---

## 10. Ikke-funksjonelle krav

- **Responsivt design:** fungerer på mobil (min. 320px), nettbrett og desktop
- **Norsk språk:** all UI-tekst på norsk bokmål
- **Tilgjengelighet:** kontrast-ratio min. 4.5:1, keyboard-navigerbar, aria-labels på ikoner
- **Lastetid:** plansøk skal vise første resultat innen 2 sekunder (vis skeleton-loader)
- **Feilhåndtering:** alle API-kall har try/catch med brukervennlig feilmelding
- **Demo-modus:** tjenesten skal fungere uten aktiv nettverksforbindelse til arealplaner.no via mock-data
- **CORS:** backend tillater kall fra localhost:3000 under utvikling
- **Miljøvariabler:** alle API-nøkler i .env, aldri i kildekode

---

## 11. Miljøvariabler

### Backend (application.properties / .env)
```
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=jdbc:postgresql://localhost:5432/naboplan
DATABASE_USERNAME=naboplan
DATABASE_PASSWORD=...
SENDGRID_API_KEY=...
APP_BASE_URL=http://localhost:3000
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8080
VITE_DEMO_MODE=false
```

---

## 12. Prioritert byggerekkefølge for Claude Code

### Fase 1 — Kjerne (bygg dette først)
1. Spring Boot-prosjekt med PostgreSQL-kobling og entiteter
2. PDF-lasting ved oppstart med Apache PDFBox (`/resources/plandata/nyhavna/`)
3. React-app med routing og Tailwind-konfigurasjon
4. Forside med Nyhavna som fast plan (ingen søk nødvendig i MVP)
5. Plandetaljside med planinfo og AI-oppsummering

### Fase 2 — Chatbot og merknad
6. Claude API-integrasjon i backend (streaming, plandata som kontekst)
7. Chatbot-komponent i frontend
8. Merknadsskriver (alle tre steg)
9. Lagring av merknad i database

### Fase 3 — Ekstra funksjoner
10. Varslingspåmelding med e-post
11. Politiker/saksbehandler-visning (merknadsoversikt)
12. Kartvisning med Nyhavna-området markert (Leaflet + hardkodet koordinater)
13. PDF-eksport av merknader

---

## 13. Spørsmål til utvikler / Claude Code

Avklar følgende før du begynner:
1. Hvilke PDF-dokumenter for Nyhavna er lastet opp under `/resources/plandata/nyhavna/`?
2. Skal frontend og backend deployes separat eller som ett prosjekt?
3. Skal PDF-eksport bruke Apache PDFBox eller iText?
4. Skal SendGrid brukes for e-post, eller er enkel SMTP-logging til konsoll nok for prototypen?

Start alltid med å sjekke at PDF-filene finnes og kan lastes. Hvis de mangler, lag en tydelig feilmelding og instruksjon om å legge dem til manuelt.

Merk alt som er hardkodet for Nyhavna med `// NYHAVNA-SPESIFIKT` slik at det er enkelt å generalisere senere.
