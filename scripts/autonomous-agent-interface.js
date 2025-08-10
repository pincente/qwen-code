// Example of how Qwen Code would interact with the Telegram bot system
// This would be integrated into the Qwen Code application logic

const fs = require('fs');
const path = require('path');

class AutonomousAgentInterface {
  constructor() {
    this.qwenDir = '/home/node/workspace/.qwen';
    this.userInputPath = path.join(this.qwenDir, 'user_input.txt');
    this.agentOutputPath = path.join(this.qwenDir, 'agent_output.txt');
    this.agentInputRequestPath = path.join(this.qwenDir, 'input_request.txt');
    
    // Create .qwen directory if it doesn't exist
    if (!fs.existsSync(this.qwenDir)) {
      fs.mkdirSync(this.qwenDir, { recursive: true });
    }
  }
  
  // Send output to the user via Telegram
  sendOutput(output) {
    try {
      fs.appendFileSync(this.agentOutputPath, output + '\n', 'utf8');
      console.log('Output sent to Telegram bot');
    } catch (err) {
      console.error('Failed to send output:', err);
    }
  }
  
  // Request input from the user via Telegram
  async requestInput(prompt) {
    try {
      // Write the input request
      fs.writeFileSync(this.agentInputRequestPath, prompt, 'utf8');
      
      // Wait for user input
      let userInput = null;
      while (userInput === null) {
        if (fs.existsSync(this.userInputPath)) {
          userInput = fs.readFileSync(this.userInputPath, 'utf8');
          // Clear the input file
          fs.writeFileSync(this.userInputPath, '', 'utf8');
          break;
        }
        // Wait 1 second before checking again
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      return userInput;
    } catch (err) {
      console.error('Failed to request input:', err);
      return null;
    }
  }
  
  // Report progress or status updates
  sendStatus(message) {
    this.sendOutput(`[STATUS] ${message}`);
  }
  
  // Report errors
  sendError(error) {
    this.sendOutput(`[ERROR] ${error}`);
  }
}

// Example usage:
/*
const agentInterface = new AutonomousAgentInterface();

// Send some output
agentInterface.sendOutput('I have completed the code review and found 3 issues.');

// Request input from user
const userInput = await agentInterface.requestInput('Please review these changes and confirm if I should proceed with the pull request.');

// Send status update
agentInterface.sendStatus('Running tests...');

// Send error if something goes wrong
agentInterface.sendError('Failed to deploy to staging environment.');
*/

module.exports = { AutonomousAgentInterface };