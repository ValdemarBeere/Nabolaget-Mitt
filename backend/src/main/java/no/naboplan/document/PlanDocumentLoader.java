package no.naboplan.document;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class PlanDocumentLoader {

    private final PlanContextService planContextService;

    // NYHAVNA-SPESIFIKT: Mock-tekst brukes når PDF-filer ikke er lastet opp
    private static final String MOCK_PLANBESKRIVELSE = """
            Områderegulering for Nyhavna, Trondheim — Planbeskrivelse (mock-data)

            Nyhavna er et tidligere industriområde i Trondheim sentrum, beliggende mellom Nedre Elvehavn og
            Brattøra. Planforslaget for Nyhavna legger til rette for en større byutviklingstransformasjon fra
            industri til en tett og blandet bybydel.

            Planens hovedformål er å omdanne Nyhavna til en levende bydel med boliger, næringslokaler, kultur
            og offentlige byrom. Planforslaget åpner for inntil 3 000 nye boliger og 1 500 arbeidsplasser i
            området. Bebyggelsen skal ha variert høyde fra 5 til 18 etasjer, med høyeste bebyggelse langs
            havnefronten.

            Utnyttelsesgraden (BRA) er satt til mellom 250% og 350% for de ulike delområdene. Dette betyr at
            samlet bygningsareal kan bli 2-3,5 ganger så stort som tomtearealet.

            Mobilitet og transport er sentralt i planen. Det legges til rette for gode gang- og sykkelforbindelser,
            og biltrafikk skal begrenses. P-normen er satt lavt (maks 0,3 biler per bolig) for å fremme kollektiv
            transport. Det planlegges en ny tverrforbindende promenade langs sjøfronten.

            Grønnstruktur og friluftsliv ivaretas gjennom krav om minst 30 kvm uteoppholdsareal per bolig.
            Det skal etableres to nye lokale parker i planområdet. Eksisterende vegetasjon langs Nidelva skal
            bevares og styrkes.

            Høyden på ny bebyggelse vil skape noe skygge for eksisterende bebyggelse øst for planområdet,
            særlig om vinteren. Det er gjennomført skyggeanalyser som viser at berørte eiendommer vil miste
            mellom 0,5 og 2 timer sol daglig om høsten.

            Planforslaget er på høring frem til 30. april 2025. Alle innbyggere kan sende inn merknader til planen.
            """;

    private static final String MOCK_PLANBESTEMMELSER = """
            Planbestemmelser for Nyhavna (mock-data)

            § 1 Formål
            Planområdet reguleres til: Boligbebyggelse, Næringsbebyggelse, Blandet bebyggelse, Offentlig
            tjenesteyting, Friområde, Samferdselsanlegg og infrastruktur.

            § 2 Utnyttelsesgrad
            Maksimal utnyttelsesgrad er BRA = 300% for delområde B1-B5.
            For delområde N1-N3 (næringsformål) er maks BRA = 250%.

            § 3 Byggehøyder
            Maks gesimshøyde er 54 meter (ca. 18 etasjer) for høyhusene langs sjøfronten.
            For øvrig bebyggelse er maks gesimshøyde 24 meter (ca. 8 etasjer).
            Minimum etasjehøyde i 1. etasje er 3,5 meter.

            § 4 Parkering
            Maksimalt 0,3 parkeringsplasser per boenhet for boligformål.
            Sykkelparkeringsdekning: minimum 2 plasser per boenhet.
            Alle parkeringsplasser skal etableres i parkeringskjeller.

            § 5 Uteoppholdsareal
            Minimum 30 kvm uteoppholdsareal per boenhet skal sikres.
            Minst 50% av uteoppholdsarealet skal ligge i sol minimum 5 timer ved jevndøgn.

            § 6 Rekkefølgekrav
            Ny infrastruktur (vann, avløp, strøm) skal etableres før boligbygging.
            Sjøpromenaden skal ferdigstilles før boliger kan tas i bruk.

            § 7 Kulturminner
            Eksisterende industribygg «Nyhavna 5» skal bevares. Det er ikke tillatt å rive dette bygget.
            """;

    @PostConstruct
    public void load() {
        Map<String, String> extracted = new LinkedHashMap<>();
        String[] filesToLoad = {"planbeskrivelse.pdf", "planbestemmelser.pdf"};

        for (String filename : filesToLoad) {
            String resourcePath = "/plandata/nyhavna/" + filename;
            try (InputStream is = getClass().getResourceAsStream(resourcePath)) {
                if (is == null) {
                    log.warn("PDF ikke funnet: {}. Legg filen til i resources/plandata/nyhavna/", filename);
                    continue;
                }
                try (PDDocument doc = PDDocument.load(is)) {
                    String text = new PDFTextStripper().getText(doc);
                    extracted.put(filename, text);
                    log.info("PDF lastet inn: {} ({} tegn)", filename, text.length());
                }
            } catch (Exception e) {
                log.error("Feil ved lesing av PDF {}: {}", filename, e.getMessage());
            }
        }

        if (extracted.size() == 2) {
            planContextService.setRealData(
                    extracted.get("planbeskrivelse.pdf"),
                    extracted.get("planbestemmelser.pdf")
            );
            log.info("=== Plandata lastet fra PDF-filer ===");
        } else {
            planContextService.setMockData(MOCK_PLANBESKRIVELSE, MOCK_PLANBESTEMMELSER);
            log.warn("=== ADVARSEL: Bruker mock-plandata. ===");
            log.warn("=== Legg til PDF-filer i backend/src/main/resources/plandata/nyhavna/ for full funksjonalitet. ===");
            log.warn("=== Nødvendige filer: planbeskrivelse.pdf, planbestemmelser.pdf ===");
        }
    }
}
