var expect = require('chai').expect
var stencils = require('../src/stencils')
describe("stencils validation", function() {
  it("should contain number for xScaleFactor", function() {
    for (stencil in stencils) {
      expect(stencils[stencil].xScaleFactor).to.be.a('number')
    }
  })

  it("should contain number for yScaleFactor", function() {
    for (stencil in stencils) {
      expect(stencils[stencil].yScaleFactor).to.be.a('number')
    }
  })

  it("should contain number for xOffset", function() {
    for (stencil in stencils) {
      expect(stencils[stencil].xOffset).to.be.a('number')
    }
  })

  it("should contain number for yOffset", function() {
    for (stencil in stencils) {
      expect(stencils[stencil].xOffset).to.be.a('number')
    }
  })

  it("should contain valid filename with no path", function() {
    for (stencil in stencils) {
      expect(stencils[stencil].fileName).to.match(/^[^/.*]+\.(png|gif|jpg|jpeg)$/)
    }
  })


})//end stencil validation
