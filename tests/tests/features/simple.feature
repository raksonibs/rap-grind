Feature: Simple Feature

  Background:
    Given I visit HOMEFILE
    Then I should see "Add Items to List"

  Scenario: Entering Task
    When I click "task bind"
    And I enter "Task#1"
    Then I click "Add Task"
    

