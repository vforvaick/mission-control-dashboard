# Telegram Webhook Integration

Real-time Telegram integration for user communication.

## Architecture

```
User (Telegram) → Webhook → Express Server → Convex → Agent Heartbeat → Response → Telegram API
```

## Webhook Setup

1. **Domain**: Use Cloudflare Tunnel for permanent URL (e.g., `lelouch.ahmari.my.id`)
2. **Express Server**: Listen on port 3001
3. **Register**: `setWebhook` with Telegram Bot API

```javascript
// Webhook endpoint
app.post('/webhook', async (req, res) => {
    const update = req.body;
    if (update.message) {
        const { chat, text, from, message_id } = update.message;
        
        // Store in Convex
        await convexClient.mutation(api.telegramInbox.create, {
            telegramUserId: from.id.toString(),
            telegramUsername: from.username,
            telegramChatId: chat.id.toString(),
            telegramMessageId: message_id.toString(),
            message: text,
            targetAgentHandle: extractTarget(text), // Default: @lelouch
            processed: false,
            createdAt: Date.now(),
        });
    }
    res.sendStatus(200);
});
```

## Message Routing

### Direct Message to Bot
- Default target: `@lelouch`
- Override with explicit mention: `@cc check my calendar`

### Forum Topics (Group)
- Each topic maps to a Board
- Messages in topic → target = board's Lead

## Agent Processing (Phase 3.25)

During heartbeat, agents check `telegramInbox`:

```javascript
// Fetch pending messages for this agent
const pending = await convexClient.query(api.telegramInbox.getPending, {
    agentHandle: agent.handle,
});

for (const msg of pending) {
    const response = await generateResponse(agent, msg.message);
    
    // Send response via Telegram API
    await telegram.sendMessage(msg.telegramChatId, response);
    
    // Mark as processed
    await convexClient.mutation(api.telegramInbox.markProcessed, {
        id: msg._id,
        response,
    });
}
```

## Outbound Notifications

Use `notificationQueue` table:

1. **Trigger event** (task completed, approval needed, etc.)
2. **Insert to queue** with `status: "pending"`
3. **Telegram Bridge** polls queue
4. **Send via API** and update `status: "sent"`

## Bot Features

- **Typing indicator**: `sendChatAction("typing")` before processing
- **Reply to message**: Include `reply_to_message_id` for context
- **Markdown formatting**: Use `parse_mode: "Markdown"`
