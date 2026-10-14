import { MCPClient } from "@mastra/mcp";

export const braveMcpClient = new MCPClient({
    id: "brave-mcp-client",
    servers: {
        "brave-search": {
            command: "npx",
            args: ["-y", "@brave/brave-search-mcp-server", "--transport", "http"],
            env: {
                "BRAVE_API_KEY": process.env.BRAVE_API_KEY || ""
            }
        }
    }
})

export const firecrawlMcpClient = new MCPClient({
    id: "firecrawl-mcp-client",
    servers: {
        "firecrawl-mcp": {
            command: "npx",
            args: [
                "-y",
                "firecrawl-mcp"
            ],
            env: {
                "FIRECRAWL_API_KEY": process.env.FIRECRAWL_API_KEY || ""
            }
        }
    },
})
