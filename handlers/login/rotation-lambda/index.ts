import {SecretsManagerRotationHandler, SecretsManagerRotationEvent, SecretsManagerRotationEventStep } from "aws-lambda"

export const handler: SecretsManagerRotationHandler = async (event: SecretsManagerRotationEvent) => {
     console.log("event",event)
}