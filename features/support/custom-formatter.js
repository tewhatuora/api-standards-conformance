const {Formatter} = require('@cucumber/cucumber');
const chalk = require('chalk');

class CustomFormatter extends Formatter {
  constructor(options) {
    super(options);
    options.eventBroadcaster.on('test-case-started', this.handleTestCaseStarted.bind(this));
    options.eventBroadcaster.on('test-case-finished', this.handleTestCaseFinished.bind(this));
    options.eventBroadcaster.on('test-step-finished', this.handleTestStepFinished.bind(this));
  }

  handleTestCaseStarted(event) {
    const {sourceLocation, pickle} = event;
    console.log('\n' + chalk.bold.blue('Test: ') + chalk.bold(pickle.name));
    console.log(chalk.gray('Location: ') + `${sourceLocation.uri}:${sourceLocation.line}` + '\n');
  }

  handleTestStepFinished(event) {
    const {testStep, result} = event;
    const {status} = result;

    // Only log steps that have a status (skipped steps don't have one)
    if (status) {
      const stepText = testStep.text || '';
      const statusColor = {
        PASSED: 'green',
        FAILED: 'red',
        SKIPPED: 'yellow',
        PENDING: 'yellow',
        UNDEFINED: 'yellow',
        AMBIGUOUS: 'red',
      }[status];

      console.log(
          chalk[statusColor](`  ${status.padEnd(9)}`) +
        chalk.gray(stepText),
      );

      // If the step failed, show the error details
      if (status === 'FAILED' && result.exception) {
        console.log('\n' + chalk.red('Error Details:'));
        console.log(chalk.red(this.formatError(result.exception)));
      }
    }
  }

  handleTestCaseFinished(event) {
    const {result} = event;
    const {status} = result;

    const statusColor = {
      PASSED: 'green',
      FAILED: 'red',
      SKIPPED: 'yellow',
      PENDING: 'yellow',
      UNDEFINED: 'yellow',
      AMBIGUOUS: 'red',
    }[status];

    console.log('\n' + chalk[statusColor](`Test ${status.toLowerCase()}`) + '\n');
    console.log(chalk.gray('─'.repeat(80)) + '\n');
  }

  formatError(error) {
    if (!error) return '';

    const errorMessage = error.message || error.toString();
    const stackTrace = error.stack || '';

    // Format the error message and stack trace
    const formattedError = [
      '  ' + errorMessage,
      ...stackTrace
          .split('\n')
          .slice(1) // Skip the first line as it's usually the same as the message
          .map((line) => '  ' + line),
    ].join('\n');

    return formattedError;
  }
}

module.exports = CustomFormatter;
