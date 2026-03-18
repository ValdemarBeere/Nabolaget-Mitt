package no.naboplan.chat;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.naboplan.claude.ClaudeApiClient;
import no.naboplan.claude.ClaudeUnavailableException;
import no.naboplan.document.PlanContextService;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ClaudeApiClient claudeApiClient;
    private final PlanContextService planContextService;
    private final ChatLogRepository chatLogRepository;

    // Nøkkelord-mappinger for fallback når Claude API ikke er tilgjengelig
    private static final Map<String, String> FALLBACK_SVAR = Map.of(
        "utnyttelsesgrad", "Utnyttelsesgrad (BRA) betyr hvor mye du kan bygge på en tomt. BRA = 300% betyr at samlet bygningsareal kan være 3 ganger så stort som tomtearealet. For Nyhavna tillates opptil 300% utnyttelse.",
        "skygge", "Planforslaget åpner for bebyggelse opptil 18 etasjer langs sjøfronten. Skyggeanalyser viser at eksisterende bebyggelse øst for Nyhavna kan miste noe sol, særlig om høsten.",
        "sol", "Planforslaget åpner for bebyggelse opptil 18 etasjer langs sjøfronten. Skyggeanalyser viser at eksisterende bebyggelse øst for Nyhavna kan miste noe sol, særlig om høsten.",
        "klage", "I en høring kan du ikke klage, men du kan sende inn merknad. Kommunen er forpliktet til å vurdere alle merknader. Etter at kommunen vedtar planen, kan du klage til Statsforvalteren innen 3 uker.",
        "stoppe", "Du kan ikke stoppe en plan, men du kan påvirke den gjennom merknader i høringsperioden. Kommunen må svare på alle merknader. Etter vedtak kan planen klages inn til Statsforvalteren.",
        "høring", "Høring er perioden der alle kan komme med innspill til et planforslag. For Nyhavna er høringsfristen 30. april 2025. Du sender inn merknad via dette skjemaet eller direkte til Trondheim kommune.",
        "merknad", "En merknad er ditt innspill til planforslaget. Du skriver hva du mener er bra eller dårlig med planen, og hva du ønsker at kommunen endrer. Kommunen er lovpålagt å behandle og svare på alle merknader.",
        "BRA", "BRA står for Bruksareal og er det arealet som faktisk kan brukes innenfor et bygg. Utnyttelsesgrad oppgitt som BRA% sier hvor mye av tomtens areal som kan bygges (inkl. alle etasjer).",
        "parkering", "Parkeringsnormen for Nyhavna er maksimalt 0,3 biler per bolig. Det er langt lavere enn vanlig, og skal fremme bruk av sykkel og kollektivtransport. Det kreves minimum 2 sykkelplasser per bolig.",
        "boliger", "Planforslaget åpner for inntil 3 000 nye boliger i Nyhavna-området. Bebyggelsen skal ha variert høyde fra 5 til 18 etasjer, med høyeste bygg langs sjøfronten."
    );

    public void streamResponse(ChatRequest request, SseEmitter emitter) {
        List<ClaudeApiClient.ChatMessage> messages = request.history().stream()
                .map(m -> new ClaudeApiClient.ChatMessage(m.role(), m.content()))
                .collect(java.util.stream.Collectors.toList());
        messages.add(new ClaudeApiClient.ChatMessage("user", request.message()));

        StringBuilder fullResponse = new StringBuilder();

        try {
            if (claudeApiClient.isAvailable()) {
                claudeApiClient.streamComplete(
                        planContextService.buildSystemPrompt(),
                        messages,
                        token -> {
                            try {
                                fullResponse.append(token);
                                emitter.send(SseEmitter.event().data(token));
                            } catch (IOException e) {
                                throw new RuntimeException(e);
                            }
                        }
                );
            } else {
                String fallback = finnFallbackSvar(request.message());
                for (String chunk : fallback.split("(?<=\\. )")) {
                    fullResponse.append(chunk);
                    emitter.send(SseEmitter.event().data(chunk));
                }
            }

            emitter.send(SseEmitter.event().name("done").data(""));
            emitter.complete();

            // Lagre chat-logg asynkront
            lagreChatLogg(request.sessionId(), request.message(), fullResponse.toString());

        } catch (ClaudeUnavailableException e) {
            try {
                String fallback = finnFallbackSvar(request.message());
                emitter.send(SseEmitter.event().data(fallback));
                emitter.send(SseEmitter.event().name("done").data(""));
                emitter.complete();
            } catch (IOException ioEx) {
                emitter.completeWithError(ioEx);
            }
        } catch (Exception e) {
            log.error("Feil i chat-streaming: {}", e.getMessage());
            emitter.completeWithError(e);
        }
    }

    private String finnFallbackSvar(String message) {
        String lower = message.toLowerCase();
        for (Map.Entry<String, String> entry : FALLBACK_SVAR.entrySet()) {
            if (lower.contains(entry.getKey().toLowerCase())) {
                return entry.getValue();
            }
        }
        return "Jeg beklager, men jeg kan ikke svare på det spørsmålet akkurat nå. " +
               "Prøv å stille et mer spesifikt spørsmål om Nyhavna-planen, eller les originaldokumentene på arealplaner.no.";
    }

    @Async
    protected void lagreChatLogg(String sessionId, String message, String response) {
        try {
            ChatLog log = new ChatLog();
            log.setSessionId(sessionId);
            log.setMessage(message);
            log.setResponse(response);
            chatLogRepository.save(log);
        } catch (Exception e) {
            // Logging av chat er ikke kritisk — ignorer feil
        }
    }
}
