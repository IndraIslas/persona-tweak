const { App } = require("@slack/bolt");
const fs = require("fs").promises;
const path = require("path");
const { createCompletion } = require("./openai");
require("dotenv").config();
// Initializes your app with your bot token and signing secret
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
    port: process.env.PORT || 3000,
});

async function loadOrCreateJSON(fileName) {
    try {
        // Check if the file exists
        console.log(fileName);
        await fs.access(fileName);

        // If the file exists, read and parse the JSON content
        const data = await fs.readFile(fileName, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        if (error.code === "ENOENT") {
            // If the file doesn't exist, create it with an empty object
            const emptyData = {};
            await fs.writeFile(
                fileName,
                JSON.stringify(emptyData, null, 2),
                "utf-8"
            );
            return emptyData;
        } else {
            // If there was another error, rethrow it
            throw error;
        }
    }
}

async function saveDictionaryToFile(fileName, dictionary) {
    try {
        // Convert the dictionary to a JSON string with pretty-printing
        const jsonString = JSON.stringify(dictionary, null, 2);

        // Write the JSON string to the specified file
        await fs.writeFile(fileName, jsonString, "utf-8");

        console.log(`Dictionary saved to ${fileName}`);
    } catch (error) {
        console.error(`Error saving dictionary to file: ${error}`);
    }
}

function isNameInList(name, list) {
    for (const item of list) {
        if (item.name === name) {
            return true;
        }
    }
    return false;
}
// console.log(process.env.PERSONAS_FILE);

app.command("/create", async ({ command, ack, say }) => {
    await ack({ text: "/create: " + command.text });
    console.log(command.user_id);
    const user_id = command.user_id;

    let text = command.text.trim();
    console.log(`"${text}"`);

    if (!text.includes("-n ") || !text.includes("-d ")) {
        say("Invalid command");
        return;
    }

    let name = "";
    let description = "";

    const nameMatch = text.match(/-n\s+([^-\s][^]*)/);
    const descriptionMatch = text.match(/-d\s+([^-\s][^]*)/);

    if (nameMatch && nameMatch[1]) {
        name = nameMatch[1].trim().split(" -d ")[0].trim();
    }

    if (descriptionMatch && descriptionMatch[1]) {
        description = descriptionMatch[1].trim().split(" -n ")[0].trim();
    }
    if (!name || !description) {
        say("Invalid command");
        return;
    }

    let personas = await loadOrCreateJSON(
        path.join(__dirname, process.env.PERSONAS_FILE)
    );
    console.log(`Name: "${name}"`);
    console.log(`Description: "${description}"`);
    if (!personas[user_id]) {
        console.log("Creating new user");
        personas[user_id] = [{ name: name, description: description }];
    } else {
        console.log("Adding to existing user");
        if (isNameInList(name, personas[user_id])) {
            say(`Persona with name ${name} already exists`);
            return;
        }
        personas[user_id].push({ name: name, description: description });
    }
    await saveDictionaryToFile(
        path.join(__dirname, process.env.PERSONAS_FILE),
        personas
    );
    say(`Persona created with name: ${name} and description: ${description}`);
});

app.command("/list-all", async ({ command, ack, say }) => {
    await ack({ text: "/list-all" });
    let personas = await loadOrCreateJSON(
        path.join(__dirname, process.env.PERSONAS_FILE)
    );
    if (!personas[command.user_id]) {
        say("No personas found for this user");
        return;
    }
    const user_id = command.user_id;
    let response = "Your personas are:\n";
    for (const persona of personas[user_id]) {
        response += `    ${persona.name}, ${persona.description}\n`;
    }
    say(response);
});

app.command("/show", async ({ command, ack, say }) => {
    await ack({ text: "/show: " + command.text });
    console.log(command.user_id);
    const user_id = command.user_id;

    let text = command.text.trim();
    console.log(`"${text}"`);

    if (!text.includes("-n ")) {
        say("Invalid command");
        return;
    }

    let name = "";

    const nameMatch = text.match(/-n\s+([^-\s][^]*)/);

    if (nameMatch && nameMatch[1]) {
        name = nameMatch[1].trim().split(" -d ")[0].trim();
    }

    if (!name) {
        say("Invalid command");
        return;
    }

    let personas = await loadOrCreateJSON(
        path.join(__dirname, process.env.PERSONAS_FILE)
    );
    console.log(`Name: "${name}"`);

    if (!personas[user_id]) {
        say("No personas found for this user");
        return;
    }
    let persona = personas[user_id].find((p) => p.name === name);
    if (!persona) {
        say(`Persona with name ${name} not found`);
        return;
    }
    say(
        `Here is your requested persona:\n${persona.name}, ${persona.description}`
    );
});

app.command("/edit", async ({ command, ack, say }) => {
    await ack({ text: "/edit: " + command.text });
    console.log(command.user_id);
    const user_id = command.user_id;

    let text = command.text.trim();
    console.log(`"${text}"`);

    if (!text.includes("-n ") || !text.includes("-d ")) {
        say("Invalid command");
        return;
    }

    let name = "";
    let description = "";

    const nameMatch = text.match(/-n\s+([^-\s][^]*)/);
    const descriptionMatch = text.match(/-d\s+([^-\s][^]*)/);

    if (nameMatch && nameMatch[1]) {
        name = nameMatch[1].trim().split(" -d ")[0].trim();
    }

    if (descriptionMatch && descriptionMatch[1]) {
        description = descriptionMatch[1].trim().split(" -n ")[0].trim();
    }
    if (!name || !description) {
        say("Invalid command");
        return;
    }

    let personas = await loadOrCreateJSON(
        path.join(__dirname, process.env.PERSONAS_FILE)
    );
    console.log(`Name: "${name}"`);
    console.log(`Description: "${description}"`);
    if (!personas[user_id]) {
        say("No personas found for this user");
        return;
    }
    if (!isNameInList(name, personas[user_id])) {
        say(`Persona with name ${name} doesn't exists`);
        return;
    }
    // replace the persona with the new one
    personas[user_id] = personas[user_id].map((p) => {
        if (p.name === name) {
            return { name: name, description: description };
        }
        return p;
    });

    await saveDictionaryToFile(
        path.join(__dirname, process.env.PERSONAS_FILE),
        personas
    );
    say(`Persona ${name} and description: ${description}`);
});

app.command("/delete", async ({ command, ack, say }) => {
    await ack({ text: "/delete: " + command.text });
    console.log(command.user_id);
    const user_id = command.user_id;

    let text = command.text.trim();
    console.log(`"${text}"`);

    if (!text.includes("-n ")) {
        say("Invalid command");
        return;
    }

    let name = "";

    const nameMatch = text.match(/-n\s+([^-\s][^]*)/);

    if (nameMatch && nameMatch[1]) {
        name = nameMatch[1].trim().split(" -d ")[0].trim();
    }

    if (!name) {
        say("Invalid command");
        return;
    }

    let personas = await loadOrCreateJSON(
        path.join(__dirname, process.env.PERSONAS_FILE)
    );
    console.log(`Name: "${name}"`);

    if (!personas[user_id]) {
        say("No personas found for this user");
        return;
    }

    const index = personas[user_id].findIndex((p) => p.name === name);
    if (index === -1) {
        say(`Persona with name ${name} not found`);
        return;
    }

    // Remove the persona from the list
    personas[user_id].splice(index, 1);

    // Save the updated personas list
    await saveDictionaryToFile(
        path.join(__dirname, process.env.PERSONAS_FILE),
        personas
    );

    say(`Deleted persona: ${name}`);
});

app.command("/ask", async ({ command, ack, say }) => {
    await ack({ text: "/ask: " + command.text });
    console.log(command.user_id);
    const user_id = command.user_id;

    let text = command.text.trim();
    console.log(`"${text}"`);

    if (!text.includes("-n ") || !text.includes("-p ")) {
        say("Invalid command");
        return;
    }

    let name = "";
    let prompt = "";

    const nameMatch = text.match(/-n\s+([^-\s][^]*)/);
    const promptMatch = text.match(/-p\s+([^-\s][^]*)/);

    if (nameMatch && nameMatch[1]) {
        name = nameMatch[1].trim().split(" -p ")[0].trim();
    }

    if (promptMatch && promptMatch[1]) {
        prompt = promptMatch[1].trim().split(" -n ")[0].trim();
    }
    if (!name || !prompt) {
        say("Invalid command");
        return;
    }

    let personas = await loadOrCreateJSON(
        path.join(__dirname, process.env.PERSONAS_FILE)
    );
    console.log(`Name: "${name}"`);
    console.log(`Prompt: "${prompt}"`);
    if (!personas[user_id]) {
        say("No personas found for this user");
        return;
    }
    if (!isNameInList(name, personas[user_id])) {
        say(`Persona with name ${name} doesn't exists`);
        return;
    }
    const persona = personas[user_id].find((p) => p.name === name);
    response = await createCompletion(prompt, persona.description);
    say(response);
});

app.command("/help", async ({ command, ack, say }) => {
    await ack({ text: "/help" });
    let response = `
    Hello! The persona bot can help you create, edit, delete, list and ask personas. Here are the commands you can use:
    - /create -n <name> -d <description>: Create a new persona with the given name and description
    - /list-all: List all personas you have created
    - /show -n <name>: Show the persona with the given name
    - /edit -n <name> -d <description>: Edit the persona with the given name
    - /delete -n <name>: Delete the persona with the given name
    - /ask -n <name> -p <prompt>: Ask the persona with the given name the given prompt

    Have fun creating personas!
    `;
    say(response);
});

(async () => {
    // Start your app
    await app.start();

    console.log("⚡️ Bolt app is running!");
})();
