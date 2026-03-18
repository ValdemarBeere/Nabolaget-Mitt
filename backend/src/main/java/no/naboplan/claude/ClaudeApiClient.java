package no.naboplan.claude;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.function.Consumer;

@Component
@Slf4j
public class ClaudeApiClient {

    @Value("${anthropic.api.key:}")
    private String apiKey;

    @Value("${anthropic.api.url:https://api.anthropic.com/v1/messages}")
    private String apiUrl;

    @Value("${anthropic.model:claude-opus-4-5}")
    private String model;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    public boolean isAvailable() {
        return apiKey != null && !apiKey.isBlank();
    }

    /**
     * Non-streaming completion — used for merknad generation.
     */
    public String complete(String systemPrompt, List<ChatMessage> messages) {
        if (!isAvailable()) {
            throw new ClaudeUnavailableException("Ingen API-nøkkel konfigurert");
        }

        try {
            String body = buildRequestBody(systemPrompt, messages, false);
            HttpRequest request = buildRequest(body);
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("Claude API feil {}: {}", response.statusCode(), response.body());
                throw new ClaudeUnavailableException("Claude API returnerte status " + response.statusCode());
            }

            JsonNode root = objectMapper.readTree(response.body());
            return root.path("content").get(0).path("text").asText();

        } catch (ClaudeUnavailableException e) {
            throw e;
        } catch (Exception e) {
            log.error("Feil ved Claude API-kall: {}", e.getMessage());
            throw new ClaudeUnavailableException("Claude API utilgjengelig: " + e.getMessage());
        }
    }

    /**
     * Streaming completion — used for chatbot. Calls tokenConsumer for each token.
     */
    public void streamComplete(String systemPrompt, List<ChatMessage> messages, Consumer<String> tokenConsumer) {
        if (!isAvailable()) {
            throw new ClaudeUnavailableException("Ingen API-nøkkel konfigurert");
        }

        try {
            String body = buildRequestBody(systemPrompt, messages, true);
            HttpRequest request = buildRequest(body);

            httpClient.send(request, HttpResponse.BodyHandlers.ofLines()).body().forEach(line -> {
                if (line.startsWith("data: ")) {
                    String data = line.substring(6).trim();
                    if (data.equals("[DONE]") || data.isEmpty()) return;
                    try {
                        JsonNode event = objectMapper.readTree(data);
                        String type = event.path("type").asText();
                        if ("content_block_delta".equals(type)) {
                            String token = event.path("delta").path("text").asText();
                            if (!token.isEmpty()) {
                                tokenConsumer.accept(token);
                            }
                        }
                    } catch (Exception e) {
                        // skip malformed SSE lines
                    }
                }
            });

        } catch (ClaudeUnavailableException e) {
            throw e;
        } catch (Exception e) {
            log.error("Feil ved streaming Claude API-kall: {}", e.getMessage());
            throw new ClaudeUnavailableException("Claude API utilgjengelig: " + e.getMessage());
        }
    }

    private String buildRequestBody(String systemPrompt, List<ChatMessage> messages, boolean stream) throws Exception {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("model", model);
        root.put("max_tokens", 1024);
        root.put("stream", stream);
        root.put("system", systemPrompt);

        ArrayNode msgs = root.putArray("messages");
        for (ChatMessage msg : messages) {
            ObjectNode m = msgs.addObject();
            m.put("role", msg.role());
            m.put("content", msg.content());
        }

        return objectMapper.writeValueAsString(root);
    }

    private HttpRequest buildRequest(String body) {
        return HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .header("x-api-key", apiKey)
                .header("anthropic-version", "2023-06-01")
                .header("content-type", "application/json")
                .timeout(Duration.ofSeconds(60))
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
    }

    public record ChatMessage(String role, String content) {}
}
