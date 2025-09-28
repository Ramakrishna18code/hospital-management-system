import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.Map;

public class SimpleWebServer {
    private static final int PORT = 8090;
    private static final String WEB_ROOT = "web";
    private static final Map<String, String> MIME_TYPES = new HashMap<>();
    
    static {
        MIME_TYPES.put(".html", "text/html");
        MIME_TYPES.put(".css", "text/css");
        MIME_TYPES.put(".js", "application/javascript");
        MIME_TYPES.put(".json", "application/json");
        MIME_TYPES.put(".png", "image/png");
        MIME_TYPES.put(".jpg", "image/jpeg");
        MIME_TYPES.put(".gif", "image/gif");
    }

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.createContext("/", new StaticFileHandler());
        server.setExecutor(null);
        System.out.println("Server started on port " + PORT);
        System.out.println("Visit http://localhost:" + PORT + " to view the application");
        server.start();
    }

    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String requestPath = exchange.getRequestURI().getPath();
            
            // Default to index.html or dashboard.html for root path
            if (requestPath.equals("/")) {
                requestPath = "/dashboard.html";
            }

            File file = new File(WEB_ROOT + requestPath);
            
            if (!file.exists() || file.isDirectory()) {
                String response = "404 (Not Found)\n";
                exchange.sendResponseHeaders(404, response.length());
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(response.getBytes());
                }
                return;
            }

            // Get MIME type
            String mimeType = getMimeType(file);
            exchange.getResponseHeaders().set("Content-Type", mimeType);

            // Send file content
            exchange.sendResponseHeaders(200, file.length());
            try (OutputStream os = exchange.getResponseBody();
                 FileInputStream fs = new FileInputStream(file)) {
                final byte[] buffer = new byte[0x10000];
                int count;
                while ((count = fs.read(buffer)) >= 0) {
                    os.write(buffer, 0, count);
                }
            }
        }

        private String getMimeType(File file) {
            String name = file.getName();
            int lastDotIndex = name.lastIndexOf('.');
            if (lastDotIndex >= 0) {
                String extension = name.substring(lastDotIndex);
                String mimeType = MIME_TYPES.get(extension.toLowerCase());
                if (mimeType != null) {
                    return mimeType;
                }
            }
            return "application/octet-stream";
        }
    }
}