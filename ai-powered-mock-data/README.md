---
path: 'ai-powered-mock-data'
title: 'Building an AI-powered Mock Data Generator'
description: 'Exploring options for mock data generation with AI.'
date: 'March 18, 2024'
category: 'AI'
---

# Building an AI-powered Mock Data Generator

## The Challenge of Scaling Mock Data

Generating mock data with AI is straightforward in principle—paste your JSON in your favorite web chat interface and you're good to go. But what happens when you need a million mock records? Or when you need mock records instantly for end-to-end tests? Waiting even a few milliseconds for an AI response might not always be the optimal solution.

Although it's a niche problem, I was curious to explore possible solutions. That's why I built [mock-rocket.com](http://mock-rocket.com).

## How mock-rocket.com Accelerates AI Generation

Mock-rocket uses a strategic combination of faker.js and batch AI callouts to generate sets of fake values. After the initial processing, mock data can be generated at **Hyper Speed!**

My goal was to investigate ways to use AI strategically. The current challenge we face in the industry is that AI, while incredibly powerful, is relatively expensive and slow compared to traditional code. For a chatbot, users might accept responses that take a few seconds, but for most applications, we need near-instant responses. This necessitates being strategic with our AI integrations.

Some popular enterprise-grade patterns for optimizing AI in production environments include caching inference results, implementing batch processing pipelines, and leveraging offline data analytics. These approaches help mitigate latency issues while maintaining the benefits of AI-powered functionality.

Mock-rocket leverages both request caching and asynchronous batch processing to deliver high-performance mock data generation at scale.

## Technical Implementation

Mock-rocket is built on Next.js, with server actions handling secure AI callouts. The data flow works as follows:

1. **User Input**: The user enters a sample JSON structure
2. **Property Flattening**: Properties are flattened into chains (e.g., 'member.address.city')
3. **Smart Mapping**: Property chains are mapped to faker.js functions using fuzzy matching algorithms
4. **AI Augmentation**: Any unidentified property chains are sent to the Anthropic API to generate a list of 10 diverse mock values
5. **Persistence**: These mock values are cached, keyed by property chain (e.g., 'member.personal.hobby: [fishing, biking, ...]')

This hybrid approach allows for speed at runtime while leveraging AI for the initial understanding of data structures.

## Future Enhancements

Looking ahead, I'm considering several improvements:

- **Pattern Recognition**: Storing AI requests in the database where common patterns could be transformed into specialized fake data functions with AI-generated values
- **Request Normalization**: Implementing AI analysis on requests to group and normalize them
- **Custom Models**: Training small, efficient custom ranking models to handle specific request types instead of always calling frontier APIs

## Retrospective

For our original problem statement of end-to-end testing and generating large datasets, it might be more efficient to generate mock data in bulk and then store it for later use. Nevertheless, mock-rocket represents an interesting exploration of what strategic AI integration can accomplish when we think carefully about where and how to apply these powerful tools.

By being thoughtful about when to use AI versus traditional programming approaches, we can create systems that harness the best of both worlds—the creativity and adaptability of AI with the speed and efficiency of conventional code.
