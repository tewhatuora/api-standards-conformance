FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and yarn.lock to the working directory
COPY package*.json yarn.lock ./

RUN yarn

# Copy the entire project to the working directory, excluding files in .dockerignore
COPY . .

RUN rm -rf features/automated-tests

# Script wrapper prepares workspace and obfuscates cucumber execution engine, only allowing users to pass additional parameters
ENTRYPOINT ["/usr/src/app/run_tests.sh"]
