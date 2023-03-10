///<reference types = "cypress"/>

import { faker } from '@faker-js/faker'
import * as pet from '../fixtures/pet.json'

pet.id = parseInt(faker.random.numeric(5))
pet.name = faker.animal.crocodilia.name
pet.category.id = parseInt(faker.random.numeric(3))
pet.category.name = faker.animal.type()
pet.status = "available"
pet.photoUrls = faker.internet.url()
pet.tags.id = faker.random.numeric(4)
pet.tags.name = faker.color.human
let updatedCategoryId = parseInt(faker.random.numeric(10))
let updatedCategoryName = faker.animal.dog()
let UpdatedPetName = faker.music.genre()
let updatedPetStatus = "sold"
let header = "'api-key': '23'"
let errorMessage = 'Pet not found'
let errorResponseType = 'error'
let errorResponseCode = 1

it('Pet creation', () => {
  cy.log('Create pet')
  cy.request('POST', '/pet', pet).then(response => {

    cy.log(`Request body: ${response.allRequestResponses[0]["Request Body"]}`)
    console.log(`Request body: ${response.allRequestResponses[0]["Request Body"]}`)
    cy.log(`Request headers: ${JSON.stringify(response.allRequestResponses[0]["Request Headers"])}`)
    cy.log(`Request url: ${JSON.stringify(response.allRequestResponses[0]["Request URL"])}`)

    expect(response.status).to.be.equal(200)
    expect(response.statusText).to.be.equal('OK')
    expect(response.isOkStatusCode).to.be.true
    expect(response.body.id).to.be.equal(pet.id)
    expect(response.body.name).to.be.equal(pet.name)
    expect(response.body.category.id).to.be.equal(pet.category.id)
    expect(response.body.category.name).to.be.equal(pet.category.name)

  })
})

it(`Get pet with id ${pet.id}`, () => {
  cy.log('Get pet')
  cy.request('GET', `/pet/${pet.id}`).then(response => {
    expect(response.status).to.be.equal(200)
    expect(response.statusText).to.be.equal('OK')
    expect(response.isOkStatusCode).to.be.true
    expect(response.body.id).to.be.equal(pet.id)
    expect(response.body.name).to.be.equal(pet.name)
    expect(response.body.category.id).to.be.equal(pet.category.id)
    expect(response.body.category.name).to.be.equal(pet.category.name)
  })
})

it(`Update pet with id ${pet.id}`, () => {

  cy.log('Update pet')
  cy.request({
    method: 'PUT',
    url: '/pet',
    body: {
      "id": pet.id,
      "category": {
        "id": updatedCategoryId,
        "name": updatedCategoryName
      },
      "name": UpdatedPetName,
      "photoUrls": [
        pet.photoUrls
      ],
      "tags": [
        {
          "id": pet.tags.id,
          "name": pet.tags.name,
        }
      ],
      "status": pet.status
    }
  }).then(response => {
    expect(response.status).to.be.equal(200)
    expect(response.statusText).to.be.equal('OK')
    expect(response.isOkStatusCode).to.be.true
  })

  cy.log('Check that pet is updated')
  cy.request('GET', `/pet/${pet.id}`).then(response => {
    expect(response.status).to.be.equal(200)
    expect(response.statusText).to.be.equal('OK')
    expect(response.isOkStatusCode).to.be.true
    expect(response.body.id).to.be.equal(pet.id)
    expect(response.body.name).to.be.equal(UpdatedPetName)
    expect(response.body.category.id).to.be.equal(updatedCategoryId)
    expect(response.body.category.name).to.be.equal(updatedCategoryName)
  })
})

it(`Find pet by status ${pet.status}`, () => {

  cy.log('Find pet and check that all pets status is available')
  cy.request('GET', '/pet/findByStatus?status=available').then(response => {
    expect(response.status).to.be.equal(200)
    expect(response.statusText).to.be.equal('OK')
    expect(response.isOkStatusCode).to.be.true
    expect(response.body.every((pet) => pet.status == pet.status)).to.be.true
  })
})

it(`Update pet with id ${pet.id} using form data`, () => {

  cy.log('Update pet')
  cy.request({
    method: 'POST',
    url: `/pet/${pet.id}`,
    body: {
      name: UpdatedPetName,
      status: updatedPetStatus,
    },
    form: true
  }).then(response => {
    expect(response.status).to.be.equal(200)
    expect(response.statusText).to.be.equal('OK')
    expect(response.isOkStatusCode).to.be.true
  })

  cy.log('Check name and status updated. Category and category name updated from prev test')
  cy.request('GET', `/pet/${pet.id}`).then(response => {
    console.log(response.body)
    expect(response.status).to.be.equal(200)
    expect(response.statusText).to.be.equal('OK')
    expect(response.isOkStatusCode).to.be.true
    expect(response.body.id).to.be.equal(pet.id)
    expect(response.body.name).to.be.equal(UpdatedPetName)
    expect(response.body.category.id).to.be.equal(updatedCategoryId)
    expect(response.body.category.name).to.be.equal(updatedCategoryName)
    expect(response.body.status).to.be.equal(updatedPetStatus)
  })
})

it(`Delete pet by ${pet.id}`, () => {

  cy.log('Delete pet')
  cy.request({
    method: 'DELETE',
    url: `/pet/${pet.id}`,
    headers: {
      header
    }
  }).then(response => {
    expect(response.status).to.be.equal(200)
  })


  cy.log('Check that pet is deleted')
  cy.request({
    method: 'GET',
    url: `/pet/${pet.id}`,
    failOnStatusCode: false
  }).then(response => {
    expect(response.status).to.be.equal(404)
    expect(response.statusText).to.be.equal('Not Found')
    expect(response.body.code).to.be.equal(errorResponseCode)
    expect(response.body.type).to.be.equal(errorResponseType)
    expect(response.body.message).to.be.equal(errorMessage)
  })
})

it('Add image', () => {

  cy.fixture('petImg.png', 'binary')  //binary - this is encoding - almost always 'binary'
    .then(fileContent => {

      //blob ?????? ???????? ?????????? ?????????????????? ?? ???????? ???????????? ?????? ???????????????? ?????????? ???? ????????????
      const blob = Cypress.Blob.binaryStringToBlob(fileContent, 'image/png') //mime type
      let formData = new FormData()
      formData.append('additionalMetadata', 'qwewe')
      formData.append('file', blob, 'petImg.png')

      cy.request({
        method: 'POST',
        url: `/pet/${pet.id}/uploadImage`,
        body: formData,
      }).then(reps => {
        expect(reps.isOkStatusCode).to.be.true
      })

    })
})


