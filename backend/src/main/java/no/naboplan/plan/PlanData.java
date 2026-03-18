package no.naboplan.plan;

import java.util.List;

// NYHAVNA-SPESIFIKT: Hardkodet plandata for Nyhavna, Trondheim
public record PlanData(
        String planId,
        String plannavn,
        String kommune,
        String kommunenummer,
        String status,
        String hoeringsfrist,
        String plantype,
        String adresse,
        double lat,
        double lng,
        String beskrivelse,
        String aiSammendrag,
        NokkelTall nokkelTall,
        List<Dokument> dokumenter,
        String kommunensHoeringsskjema,
        boolean usingMockData
) {
    public record NokkelTall(
            String maksEtasjer,
            String utnyttelsesgrad,
            String areal,
            String plantype
    ) {}

    public record Dokument(
            String navn,
            String fil,
            String url
    ) {}
}
