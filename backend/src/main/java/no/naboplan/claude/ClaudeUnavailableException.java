package no.naboplan.claude;

public class ClaudeUnavailableException extends RuntimeException {
    public ClaudeUnavailableException(String message) {
        super(message);
    }
}
