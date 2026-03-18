package no.naboplan.merknad;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/merknad")
@RequiredArgsConstructor
public class MerknadController {

    private final MerknadService merknadService;

    @PostMapping("/generer")
    public ResponseEntity<Map<String, String>> generer(@RequestBody GenererRequest request) {
        String utkast = merknadService.genererMerknadUtkast(
                request.planId(),
                request.temaer(),
                request.fritekst()
        );
        return ResponseEntity.ok(Map.of("utkast", utkast));
    }

    @PostMapping("/lagre")
    public ResponseEntity<Map<String, String>> lagre(@RequestBody LagreRequest request) {
        Merknad merknad = merknadService.lagreMerknad(
                request.planId(),
                request.tekst(),
                request.email(),
                request.temaer()
        );
        return ResponseEntity.ok(Map.of(
                "id", merknad.getId().toString(),
                "melding", "Din merknad er lagret. Takk for at du deltar i planprosessen!"
        ));
    }

    public record GenererRequest(String planId, List<String> temaer, String fritekst) {}

    public record LagreRequest(String planId, String tekst, String email, List<String> temaer) {}
}
