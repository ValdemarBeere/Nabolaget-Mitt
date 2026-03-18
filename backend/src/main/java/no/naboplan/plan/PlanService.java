package no.naboplan.plan;

import no.naboplan.document.PlanContextService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlanService {

    private final PlanContextService planContextService;

    public PlanService(PlanContextService planContextService) {
        this.planContextService = planContextService;
    }

    // NYHAVNA-SPESIFIKT: Returnerer hardkodet plandata for Nyhavna
    public PlanData getNyhavnaPlan() {
        return new PlanData(
                "nyhavna-2024",
                "Områderegulering for Nyhavna",
                "Trondheim",
                "5001",
                "høring",
                "2025-04-30",
                "Områderegulering",
                "Nyhavna, Trondheim",
                63.4420,
                10.4180,
                "Områderegulering for Nyhavna omfatter transformasjon av tidligere industriområde til blandet by " +
                "med boliger, næring og offentlige byrom ved Trondheims havnefront.",
                "Dette planforslaget gjelder Nyhavna, et tidligere industriområde ved havna i Trondheim sentrum. " +
                "De viktigste endringene er at området skal bygges om til en ny bydel med opptil 3 000 boliger, " +
                "arbeidsplasser og en offentlig sjøpromenade. Dette kan bety for deg som bor i nærheten at du " +
                "vil få mer aktivitet og ny bebyggelse i området, men også noe mer skygge og trafikk i anleggsperioden.",
                new PlanData.NokkelTall(
                        "18 etasjer",
                        "BRA = 300%",
                        "ca. 450 daa",
                        "Områderegulering"
                ),
                List.of(
                        new PlanData.Dokument(
                                "Planbeskrivelse",
                                "planbeskrivelse.pdf",
                                "https://innsyn.trondheim.kommune.no"
                        ),
                        new PlanData.Dokument(
                                "Planbestemmelser",
                                "planbestemmelser.pdf",
                                "https://innsyn.trondheim.kommune.no"
                        ),
                        new PlanData.Dokument(
                                "Plankart",
                                "plankart.pdf",
                                "https://innsyn.trondheim.kommune.no"
                        )
                ),
                "https://innsyn.trondheim.kommune.no/hoering/nyhavna-2024",
                planContextService.isUsingMockData()
        );
    }
}
