package no.naboplan.merknad;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "merknader")
@Getter
@Setter
@NoArgsConstructor
public class Merknad {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = true)
    private String email;

    @Column(name = "plan_id", nullable = false)
    private String planId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String tekst;

    // Stored as comma-separated values to avoid array type complexity
    @Column(name = "temaer")
    private String temaer;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    public Merknad(String email, String planId, String tekst, String temaer) {
        this.email = email;
        this.planId = planId;
        this.tekst = tekst;
        this.temaer = temaer;
    }
}
