package no.naboplan.merknad;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.naboplan.claude.ClaudeApiClient;
import no.naboplan.claude.ClaudeUnavailableException;
import no.naboplan.document.PlanContextService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MerknadService {

    private final ClaudeApiClient claudeApiClient;
    private final PlanContextService planContextService;
    private final MerknadRepository merknadRepository;

    public String genererMerknadUtkast(String planId, List<String> temaer, String fritekst) {
        String temaerStr = String.join(", ", temaer);
        String userPrompt = """
                Skriv en formell høringmerknad på vegne av en innbygger i Trondheim.

                Innbyggerens bekymringer gjelder følgende temaer: %s

                Innbyggeren beskriver bekymringen sin slik:
                "%s"

                Skriv en merknad som:
                1. Er adressert til Trondheim kommune
                2. Refererer til "Områderegulering for Nyhavna (planId: nyhavna-2024)"
                3. Beskriver bekymringen konkret
                4. Foreslår hva kommunen bør gjøre annerledes
                5. Er skrevet i formell men forståelig norsk bokmål
                """.formatted(temaerStr, fritekst);

        try {
            return claudeApiClient.complete(
                    planContextService.buildMerknadSystemPrompt(),
                    List.of(new ClaudeApiClient.ChatMessage("user", userPrompt))
            );
        } catch (ClaudeUnavailableException e) {
            log.warn("Claude API utilgjengelig, bruker fallback-merknad: {}", e.getMessage());
            return genererFallbackMerknad(temaer, fritekst);
        }
    }

    public Merknad lagreMerknad(String planId, String tekst, String email, List<String> temaer) {
        String temaerStr = temaer != null ? String.join(",", temaer) : "";
        // NYHAVNA-SPESIFIKT: planId settes alltid til nyhavna-2024 i prototypen
        Merknad merknad = new Merknad(email, "nyhavna-2024", tekst, temaerStr);
        return merknadRepository.save(merknad);
    }

    private String genererFallbackMerknad(List<String> temaer, String fritekst) {
        String temaerStr = String.join(", ", temaer);
        return """
                Til Trondheim kommune

                Jeg ønsker med dette å sende inn en merknad til Områderegulering for Nyhavna (planId: nyhavna-2024).

                Mine bekymringer gjelder: %s

                %s

                Jeg ber kommunen vurdere disse hensynene grundig i den videre planbehandlingen, og sikre at planforslaget ivaretar behovene til eksisterende innbyggere i området.

                Med vennlig hilsen
                [Ditt navn]
                [Din adresse]
                """.formatted(temaerStr, fritekst);
    }
}
