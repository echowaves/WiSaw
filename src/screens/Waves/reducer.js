/* global console */
import { gql } from '@apollo/client'
import * as CONST from '../../consts'

export const listWaves = async ({ pageNumber, batch, uuid }) => {
  try {
    const response = await CONST.gqlClient.query({
      query: gql`
        query listWaves($pageNumber: Int!, $batch: String!, $uuid: String) {
          listWaves(pageNumber: $pageNumber, batch: $batch, uuid: $uuid) {
            waves {
              waveUuid
              name
              createdAt
              updatedAt
              createdBy
            }
            batch
            noMoreData
          }
        }
      `,
      variables: {
        pageNumber,
        batch,
        uuid
      },
      fetchPolicy: 'network-only',
    })
    return response.data.listWaves
  } catch (err) {
    console.error({ err })
    throw err
  }
}

export const createWave = async ({ name, description, uuid }) => {
  try {
    const response = await CONST.gqlClient.mutate({
      mutation: gql`
        mutation createWave($name: String!, $description: String!, $uuid: String!) {
          createWave(name: $name, description: $description, uuid: $uuid) {
            waveUuid
            name
            createdAt
            updatedAt
            createdBy
          }
        }
      `,
      variables: {
        name,
        description,
        uuid
      },
    })
    return response.data.createWave
  } catch (err) {
    console.error({ err })
    throw err
  }
}

export const deleteWave = async ({ waveUuid, uuid }) => {
  try {
    const response = await CONST.gqlClient.mutate({
      mutation: gql`
        mutation deleteWave($waveUuid: String!, $uuid: String!) {
          deleteWave(waveUuid: $waveUuid, uuid: $uuid)
        }
      `,
      variables: {
        waveUuid,
        uuid
      },
    })
    return response.data.deleteWave
  } catch (err) {
    console.error({ err })
    throw err
  }
}
