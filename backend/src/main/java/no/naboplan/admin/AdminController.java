package no.naboplan.admin;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.naboplan.claude.ClaudeApiClient;
import no.naboplan.claude.ClaudeUnavailableException;
import no.naboplan.merknad.Merknad;
import no.naboplan.merknad.MerknadRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/plan")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final MerknadRepository merknadRepository;
    private final ClaudeApiClient claudeApiClient;

    // NYHAVNA-SPESIFIKT: ingen autentisering i prototype
    @GetMapping("/{planId}/admin")
    public ResponseEntity<AdminStats> getAdminStats(@PathVariable String planId) {
        List<Merknad> merknader = merknadRepository.findByPlanIdOrderByCreatedAtDesc(planId);
        long totalt = merknader.size();

        // Grupper etter tema
        Map<String, List<Merknad>> gruppert = new LinkedHashMap<>();
        for (Merknad m : merknader) {
            if (m.getTemaer() != null && !m.getTemaer().isBlank()) {
                String[] temaer = m.getTemaer().split(",");
                for (String tema : temaer) {
                    gruppert.computeIfAbsent(tema.trim(), k -> new ArrayList<>()).add(m);
                }
            } else {
                gruppert.computeIfAbsent("Annet", k -> new ArrayList<>()).add(m);
            }
        }

        List<TemaGruppe> temaGrupper = gruppert.entrySet().stream()
                .map(e -> new TemaGruppe(e.getKey(), e.getValue().size(), e.getValue()))
                .sorted(Comparator.comparingInt(TemaGruppe::antall).reversed())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new AdminStats(totalt, temaGrupper, merknader));
    }

    @PostMapping("/{planId}/oppsummering")
    public ResponseEntity<Map<String, String>> lagOppsummering(@PathVariable String planId) {
        List<Merknad> merknader = merknadRepository.findByPlanIdOrderByCreatedAtDesc(planId);
        if (merknader.isEmpty()) {
            return ResponseEntity.ok(Map.of("oppsummering", "Ingen merknader mottatt ennå."));
        }

        String alleTekster = merknader.stream()
                .map(m -> "- " + m.getTekst())
                .collect(Collectors.joining("\n"));

        String prompt = """
                Lag en tematisk sammendrag av følgende høringmerknader til Nyhavna-planen.
                Grupper dem etter tema og gi en kort beskrivelse av hovedpunktene i hver gruppe.
                Skriv på norsk bokmål.

                Merknader:
                %s
                """.formatted(alleTekster);

        try {
            String oppsummering = claudeApiClient.complete(
                    "Du er en kommunal saksbehandler som lager tematiske sammendrag av høringmerknader. Svar på norsk.",
                    List.of(new ClaudeApiClient.ChatMessage("user", prompt))
            );
            return ResponseEntity.ok(Map.of("oppsummering", oppsummering));
        } catch (ClaudeUnavailableException e) {
            return ResponseEntity.ok(Map.of("oppsummering",
                    "Mottatt " + merknader.size() + " merknader. Claude API er ikke tilgjengelig for automatisk sammendrag."));
        }
    }

    public record AdminStats(long totalt, List<TemaGruppe> temaGrupper, List<Merknad> alleMerknader) {}
    public record TemaGruppe(String tema, int antall, List<Merknad> merknader) {}
}
