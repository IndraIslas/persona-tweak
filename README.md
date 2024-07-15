# Persona Bot

Persona Bot is a Slack bot designed to help users manage and interact with different personas. Users can create, list, show, edit, delete, and interact with their personas using various slash commands.

A possible use case for this could be creating personas for different roles in essay writing. For instance, a persona could be focused on gramatical error, another on sentence structure, and another on content. Users could then ask these personas questions related to their specific areas of expertise.

## Installation

To install and run the bot, follow these steps:

1. Clone the repository:

    ```bash
    git clone <repository_url>
    cd <repository_name>
    ```

2. Install the necessary dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and add the following environment variables:

    ```env
    SLACK_BOT_TOKEN=your-slack-bot-token
    SLACK_SIGNING_SECRET=your-slack-signing-secret
    SLACK_APP_TOKEN=your-slack-app-token
    PORT=3000
    PERSONAS_FILE=personas.json
    OPENAI_API_KEY=your-openai-api-key
    GPT_MODEL=gpt-4o
    ```

4. Run the bot:
    ```bash
    npm run dev
    ```

## Slash Commands

### 1. `/create`

Create a new persona.

**Usage:**

```bash
/create -n <name> -d <description>
```

**Explanation:**

-   `-n <name>`: Specifies the name of the persona.
-   `-d <description>`: Specifies the description of the persona.

**Example:**

```bash
/create -n JohnDoe -d "You are an expert Bot in gramatical errors, analyse the user's input to find and correct gramatical errors."
```

### 2. `/list-all`

List all personas created by the user.

**Usage:**

```bash
/list-all
```

**Explanation:**
This command lists all personas that the user has created along with their descriptions.

### 3. `/show`

Show the details of a specific persona.

**Usage:**

```bash
/show -n <name>
```

**Explanation:**

-   `-n <name>`: Specifies the name of the persona to show.

**Example:**

```bash
/show -n JohnDoe
```

### 4. `/edit`

Edit an existing persona.

**Usage:**

```bash
/edit -n <name> -d <description>
```

**Explanation:**

-   `-n <name>`: Specifies the name of the persona to edit.
-   `-d <description>`: Specifies the new description of the persona.

**Example:**

```bash
/edit -n JohnDoe -d "An updated description for John Doe."
```

### 5. `/delete`

Delete a persona.

**Usage:**

```bash
/delete -n <name>
```

**Explanation:**

-   `-n <name>`: Specifies the name of the persona to delete.

**Example:**

```bash
/delete -n JohnDoe
```

### 6. `/ask`

Ask a persona a question based on their description.

**Usage:**

```bash
/ask -n <name> -p <prompt>
```

**Explanation:**

-   `-n <name>`: Specifies the name of the persona to ask.
-   `-p <prompt>`: Specifies the prompt to ask the persona.

**Example:**

```bash
/ask -n JohnDoe -p "What is the best way to learn JavaScript?"
```

### 7. `/help`

Display help information for using the bot.

**Usage:**

```bash
/help
```

**Explanation:**
This command provides an overview of all available commands and how to use them.

## Create Slack App

Use the following App Manifest

```yaml
display_information:
    name: persona-bot
features:
    bot_user:
        display_name: persona-bot
        always_online: false
    slash_commands:
        - command: /create
          description: Creates a new persona. Use -n for name and -d for description.
          usage_hint: -n Enemy -d You are a Bot that is mean and sarcastic
          should_escape: false
        - command: /list-all
          description: Lists all personas created for a user
          should_escape: false
        - command: /show
          description: Returns the description of the given persona
          usage_hint: -n Enemy
          should_escape: false
        - command: /edit
          description: Edit and existing user persona's description
          usage_hint: "/edit -n Enemy -d You are a jealous friend of the user that doesn't want to admit that the user is better than you "
          should_escape: false
        - command: /delete
          description: Deletes a persona
          usage_hint: -n Enemy
          should_escape: false
        - command: /ask
          description: Ask something to one of your personas
          usage_hint: /ask -n Enemy -p what do you think of my essay? (paste essay)
          should_escape: false
        - command: /help
          description: Explains how to use the bot
          should_escape: false
oauth_config:
    scopes:
        bot:
            - commands
            - im:history
            - im:read
            - im:write
            - chat:write
settings:
    event_subscriptions:
        bot_events:
            - message.im
    interactivity:
        is_enabled: true
    org_deploy_enabled: false
    socket_mode_enabled: true
    token_rotation_enabled: false
```
