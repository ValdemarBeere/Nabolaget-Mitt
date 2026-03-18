package no.naboplan.chat;

import java.util.List;

public record ChatRequest(
        String planId,
        String message,
        String sessionId,
        List<HistoryMessage> history
) {
    public record HistoryMessage(String role, String content) {}
}
