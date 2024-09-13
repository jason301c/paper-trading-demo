# Demo Paper Trading Website
This is a website designed for the user to paper trade, which is to buy/sell stocks with paper money.\
This was originally made as a take home assessment for Monash Association of Coding.

## Table of Contents
- [Features](#features)
  - [Dashboard](#dashboard)
  - [Buy Stocks](#buy-stocks)
  - [Sell Stocks](#sell-stocks)
  - [Real-time Data](#real-time-data)
- [The Full Stack](#the-full-stack)
- [Challenges](#challenges)

## Features
#### Dashboard
View your current portfolio and performance.\
<img width="600" alt="image" src="https://github.com/user-attachments/assets/fbfab9f9-ed77-46e0-8ffa-02a8267524d5">
#### Buy Stocks
Purchase stocks using paper money.
*NOTE*: In this implementation, you **can** buy the same stock multiple times. This is not implemented by keeping track of all the transactions, but by keeping track of the average price.\
<img width="600" alt="image" src="https://github.com/user-attachments/assets/b8a57e9d-b91b-447f-b9c9-85ee0d8b3026">
#### Sell Stocks
Sell your stocks to realize gains or cut losses.
*NOTE*: Keep in mind that previous transactions' profit and losses are not kept track in this implementation\
<img width="600" alt="image" src="https://github.com/user-attachments/assets/8f63d22f-a663-4419-a7e9-b1f251fec424">
#### Real-time Data
Fetch real-time stock data using [Finnhub](https://finnhub.io/docs/api) API.

## The Full Stack
- **Frontend**: Built with [Next.js](https://nextjs.org/) and [React](https://reactjs.org/).
- **Styling**: Utilizes [Tailwind CSS](https://tailwindcss.com/) for styling.
- **Backend**: API routes handled by [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction).
- **Database**: Uses [Supabase](https://supabase.io/) for database and authentication.
- **Deployment**: Uses [Vercel]() for deploying and CI/CD. (Note that deploying needs to be done manualy, due to the fact that Vercel's free plan doesn't allow automatic deployments from an organization's repository.)

## Challenges
- **Frontend**. Although this is a simple front-end, I had to learn HTML and CSS from scratch (given that I had never touched it before)
- **React? JavaScript? TypeScript?** I didn't even know the difference between TS and JS before embarking on this project.
- **Making routes and API calls**, as although I had experience with using API's before, I had to learn how to make API routes (in a language I've never seen before)
- **TypeScript**. Learning how to use Types efficiently in TS was difficult at first.
