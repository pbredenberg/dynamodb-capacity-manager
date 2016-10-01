'use strict';

var _ = require('underscore'),
    Class = require('class.extend'),
    Runner = require('./Runner'),
    DCM = require('./index');

module.exports = Class.extend({

   init: function() {
      this._resourceLister = null;
      this._excludedResources = [];
      this._handleReads = false;
      this._handleWrites = false;
      this._userDefaultConfig = {};
      this._perResourceConfigs = {};
   },

   findResourcesWith: function(resourceLister) {
      this._resourceLister = resourceLister;
      return this;
   },

   excludeTable: function(tableName) {
      this._excludedResources.push(DCM.makeResourceName(tableName));
   },

   excludeIndex: function(tableName, indexName) {
      this._excludedResources.push(DCM.makeResourceName(tableName, indexName));
   },

   handleReads: function() {
      this._handleReads = true;
      return this;
   },

   handleWrites: function() {
      this._handleWrites = true;
      return this;
   },

   handleReadsAndWrites: function() {
      return this.handleReads().handleWrites();
   },

   defaultRuleConfig: function(config) {
      this._userDefaultConfig = config || {};
      return this;
   },

   ruleConfigForTable: function(tableName, type, config) {
      return this._saveRuleConfigForResource(tableName, undefined, type, config);
   },

   ruleConfigForIndex: function(tableName, indexName, type, config) {
      return this._saveRuleConfigForResource(tableName, indexName, type, config);
   },

   _saveRuleConfigForResource: function(tableName, indexName, type, config) {
      var resourceName = DCM.makeResourceName(tableName, indexName);

      if (!this._perResourceConfigs[resourceName]) {
         this._perResourceConfigs[resourceName] = {};
      }

      this._perResourceConfigs[resourceName][type] = config;
      return this;
   },

   getConfigForResource: function(resource) {
      var perResource = this._perResourceConfigs[resource.name],
          forType = perResource ? perResource[resource.capacityType] : {};

      return _.extend({}, DCM.DEFAULT_RESOURCE_CONFIG, this._userDefaultConfig, forType);
   },

   build: function() {
      // TODO: validate that required configuration was supplied
      return new Runner(this);
   },

});