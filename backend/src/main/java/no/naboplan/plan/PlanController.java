package no.naboplan.plan;

import lombok.RequiredArgsConstructor;
import no.naboplan.merknad.Merknad;
import no.naboplan.merknad.MerknadRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plan")
@RequiredArgsConstructor
public class PlanController {

    private final PlanService planService;
    private final MerknadRepository merknadRepository;

    @GetMapping
    public ResponseEntity<PlanData> getPlan() {
        return ResponseEntity.ok(planService.getNyhavnaPlan());
    }

    @GetMapping("/dokumenter")
    public ResponseEntity<PlanData.Dokument[]> getDokumenter() {
        PlanData plan = planService.getNyhavnaPlan();
        return ResponseEntity.ok(plan.dokumenter().toArray(new PlanData.Dokument[0]));
    }

    @GetMapping("/merknader")
    public ResponseEntity<List<Merknad>> getMerknader() {
        // NYHAVNA-SPESIFIKT: Henter alle merknader for nyhavna-2024
        return ResponseEntity.ok(merknadRepository.findByPlanIdOrderByCreatedAtDesc("nyhavna-2024"));
    }
}
