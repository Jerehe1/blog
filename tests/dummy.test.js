const { test, describe } = require('node:test')
const assert = require('node:assert')
const Listhelper = require('../utils/list_helper')

test('dummy returns one', () => {
  assert.strictEqual(Listhelper.dummy([]), 1)
})
