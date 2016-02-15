NODE_MODULES = ./node_modules
BIN = $(NODE_MODULES)/.bin

.PHONY: all
all:

.PHONY: setup
setup:
	npm install

.PHONY: src-cov
src-cov: clean-coverage
	$(BIN)/istanbul instrument --output ./build/src-cov src

.PHONY: test
test:
	$(BIN)/mocha

.PHONY: docs
docs: clean-docs
	$(BIN)/jsdoc --recurse src config.js index.js --private --destination ./build/docs --readme ./README.md --access all --encoding utf8

.PHONY: coverage
coverage: src-cov
	$(BIN)/istanbul cover $(BIN)/_mocha -x "context.js"

.PHONY: clean
clean: clean-coverage clean-docs

.PHONY: clean-coverage
clean-coverage:
	-rm -rf ./build/src-cov
	-rm -rf ./build/coverage

.PHONY: clean-docs
clean-docs:
	-rm -rf ./build/docs

.PHONY: changelog
changelog:
ifeq (, $(shell which gitchangelog))
 $(error "No gitchangelog path, consider doing pip install gitchangelog")
endif
ifeq (, $(shell which pystache))
 $(error "No pystache path, consider doing pip install pystache")
endif
	gitchangelog > CHANGELOG.md

.PHONY: eslint-html
eslint-html:
	$(BIN)/eslint . --output-file ./build/eslint.html --format html

.PHONY: eslint
eslint:
	$(BIN)/eslint . --fix

.PHONY: jscs
jscs:
	$(BIN)/jscs . --config .jscsrc

.PHONY: jscs-xml
jscs-xml:
	$(BIN)/jscs . --config .jscsrc --reporter checkstyle > ./build/jscs.xml
