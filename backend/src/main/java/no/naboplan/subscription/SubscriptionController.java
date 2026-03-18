package no.naboplan.subscription;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
@Slf4j
public class SubscriptionController {

    private final SubscriptionRepository subscriptionRepository;

    @PostMapping
    public ResponseEntity<Map<String, String>> subscribe(@RequestBody SubscribeRequest request) {
        Subscription sub = new Subscription();
        sub.setEmail(request.email());
        sub.setLabel(request.label());
        sub.setLat(request.lat());
        sub.setLng(request.lng());
        sub.setRadiusKm(request.radiusKm() != null ? request.radiusKm() : 1);
        subscriptionRepository.save(sub);

        log.info("Ny varslingspåmelding: {} for område {}", request.email(), request.label());

        return ResponseEntity.ok(Map.of(
                "id", sub.getId().toString(),
                "melding", "Du er nå påmeldt varsling for " + request.label()
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> unsubscribe(@PathVariable UUID id) {
        subscriptionRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("melding", "Varsling avmeldt"));
    }

    public record SubscribeRequest(
            String email,
            String label,
            Double lat,
            Double lng,
            Integer radiusKm
    ) {}
}
