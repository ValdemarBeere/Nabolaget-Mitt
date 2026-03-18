package no.naboplan.document;

import lombok.Getter;
import org.springframework.stereotype.Service;

@Service
@Getter
public class PlanContextService {

    private String planbeskrivelseTekst;
    private String planbestemmelseTekst;
    private boolean usingMockData = true;

    void setRealData(String planbeskrivelse, String planbestemmelser) {
        this.planbeskrivelseTekst = truncate(planbeskrivelse, 16000);
        this.planbestemmelseTekst = truncate(planbestemmelser, 8000);
        this.usingMockData = false;
    }

    void setMockData(String planbeskrivelse, String planbestemmelser) {
        this.planbeskrivelseTekst = planbeskrivelse;
        this.planbestemmelseTekst = planbestemmelser;
        this.usingMockData = true;
    }

    public String buildSystemPrompt() {
        return """
                Du er en planassistent for Nyhavna i Trondheim.
                Du svarer alltid på norsk og bruker aldri planfaglige fagtermer uten å forklare dem.
                Svar skal være korte og konkrete (2-4 setninger).
                Vær vennlig og hjelp innbyggere å forstå hva planen betyr for dem personlig.

                Her er planmaterialet for Nyhavna:

                [PLANBESKRIVELSE]
                %s

                [PLANBESTEMMELSER]
                %s

                Svar kun basert på dette materialet.
                Hvis du ikke finner svaret i dokumentene, si det ærlig og foreslå at brukeren leser originaldokumentet.
                """.formatted(planbeskrivelseTekst, planbestemmelseTekst);
    }

    public String buildMerknadSystemPrompt() {
        return """
                Du er en assistent som hjelper norske innbyggere å formulere høringmerknader til kommunale reguleringsplaner.
                Du skriver alltid på norsk bokmål. Merknaden skal være formell men forståelig.
                Merknaden skal inkludere: hva bekymringen gjelder, konkret referanse til planen, og hva innbyggeren ønsker at kommunen gjør.
                Hold merknaden på 150-300 ord.

                Planens formelle opplysninger:
                Plan: Områderegulering for Nyhavna (planId: nyhavna-2024)
                Kommune: Trondheim
                Status: Høring

                Planinnhold for referanse:
                [PLANBESKRIVELSE]
                %s

                [PLANBESTEMMELSER]
                %s
                """.formatted(planbeskrivelseTekst, planbestemmelseTekst);
    }

    private String truncate(String text, int maxChars) {
        if (text == null) return "";
        return text.length() > maxChars ? text.substring(0, maxChars) + "..." : text;
    }
}
