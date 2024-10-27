# Event Monitoring Tool

**Note : This is a work in progress repo currently as not many features can be implemented in a matter of few days**

## Overview
The Event Monitoring Tool is designed to facilitate chain developers in accessing and monitoring events during the development and testing phases of blockchain applications. This tool addresses the challenges faced by developers during local testing of their blockchain nodes, especially when it comes to tracking events and state changes.

## Use Case

### Problem Statement
When chain developers conduct local testing, they often run into issues where critical event data is lost if the testing chain experiences a failure. Tracking the progression of testing steps and understanding the resulting state changes after executing transactions can be cumbersome and inefficient. This situation becomes particularly problematic during fuzz testing, where random inputs are thrown at the chain to identify vulnerabilities and potential issues.

### Goals
The primary goals of this project are:

- Event Preservation: Ensure that all events generated during local testing are preserved and easily accessible, even if the testing chain breaks or resets.
- Enhanced Visibility: Provide a comprehensive view of the testing process, making it easier for developers to understand and track the outcomes of their testing steps.
- Simplified Debugging: Facilitate debugging by allowing developers to trace all transactions executed in order, along with the corresponding actions and state changes they triggered.

### Features
- Real-time Event Monitoring: Capture and store events generated during local testing to prevent data loss.
- Detailed Transaction Logs: Log all transactions with relevant details, enabling developers to analyze the sequence of actions taken during testing.
- User-Friendly API: Provide a straightforward API to fetch blocks, transactions, and events, allowing developers to easily integrate event monitoring into their workflows.
- Customizable Query Options: Allow users to filter transactions and events based on specific criteria, enhancing the analysis process.

### Benefits
- Improved Development Workflow: By providing easy access to event data, developers can streamline their testing processes, saving time and effort in identifying issues.
- Enhanced Testing Confidence: With a better understanding of the state changes and transaction flows, developers can push code to the mainnet with increased confidence, knowing that they have thoroughly tested their changes.
- Support for Fuzz Testing: The tool is particularly useful during fuzz testing scenarios, where tracking state changes and understanding the impact of random inputs is critical for identifying vulnerabilities.

### Conclusion

The Event Monitoring Tool serves as a vital resource for blockchain developers, bridging the gap between local testing and mainnet deployment. By enabling effective tracking of events and state changes, the tool empowers developers to enhance their testing processes, ultimately leading to more robust and reliable blockchain applications.


## Setup

### Requirements

- `Postgresql`
- `npm`
- `go`

### Starting the service

Setup the .env file with endpoints

Then, run :  
```shell
npm start
```
Once the service is up and running, check any of the following links for api data:

```http://localhost:3000/api/blocks```

```http://localhost:3000/api/transactions```

```http://localhost:3000/api/events```

And other links by exploring the repository.
