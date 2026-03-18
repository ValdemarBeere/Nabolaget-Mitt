package no.naboplan.chat;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.concurrent.ExecutorService;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;
    private final ExecutorService sseExecutor;

    @PostMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chat(@RequestBody ChatRequest request) {
        SseEmitter emitter = new SseEmitter(60_000L);

        sseExecutor.submit(() -> {
            try {
                chatService.streamResponse(request, emitter);
            } catch (Exception e) {
                log.error("Feil i SSE-tråd: {}", e.getMessage());
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }
}
