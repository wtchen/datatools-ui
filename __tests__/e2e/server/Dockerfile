# syntax=docker/dockerfile:1
FROM maven:3.8.6-openjdk-8
WORKDIR /datatools

# Grab latest dev build of Datatools Server
RUN git clone https://github.com/ibi-group/datatools-server.git
WORKDIR /datatools/datatools-server
RUN mvn package -DskipTests
RUN cp target/dt*.jar ./datatools-server-3.8.1-SNAPSHOT.jar

# Grab latest dev build of OTP
RUN wget https://repo1.maven.org/maven2/org/opentripplanner/otp/1.4.0/otp-1.4.0-shaded.jar
RUN mkdir -p /tmp/otp/graphs
RUN mkdir -p /var/datatools_gtfs

RUN mkdir ~/.aws && printf '%s\n' '[default]' 'aws_access_key_id=${AWS_ACCESS_KEY_ID}' 'aws_secret_access_key=${AWS_SECRET_ACCESS_KEY}' 'region=${AWS_REGION}' > ~/.aws/config

# Grab server config
RUN mkdir /config
RUN wget https://raw.githubusercontent.com/ibi-group/datatools-server/dev/configurations/default/server.yml.tmp -O /config/server.yml

# The enviornment variables contain everything needed on the server
RUN touch /config/env.yml
RUN env | sed 's/\=/\:/' > /config/env.yml

COPY __tests__/e2e/server/launch.sh launch.sh
RUN chmod +x launch.sh
CMD ./launch.sh
EXPOSE 8080
EXPOSE 4000
