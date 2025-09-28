package com.hospital;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.ResourceHandler;
import org.eclipse.jetty.server.handler.HandlerList;
import org.eclipse.jetty.server.handler.DefaultHandler;

public class WebServer {
    public static void main(String[] args) throws Exception {
        Server server = new Server(8080);

        ResourceHandler resourceHandler = new ResourceHandler();
        resourceHandler.setDirectoriesListed(true);
        resourceHandler.setWelcomeFiles(new String[]{"dashboard.html"});
        
        // Set the resource base to the web directory
        String webDir = System.getProperty("user.dir") + "/web";
        resourceHandler.setResourceBase(webDir);

        HandlerList handlers = new HandlerList();
        handlers.setHandlers(new org.eclipse.jetty.server.Handler[]{
            resourceHandler, new DefaultHandler()
        });
        server.setHandler(handlers);

        System.out.println("Starting server on port 8080...");
        System.out.println("Visit http://localhost:8080 to view the application");
        
        server.start();
        server.join();
    }
}