import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Observable, of, Subscription } from 'rxjs';
import { CreateSchemaDTO, DecisionTableMessage, DecisionTableService, RulesWithAllowedValues, ValuesDTO } from './decision-table.service';
import * as _ from 'lodash';

export interface SelectOption {
  key: string;
  value: string;
}

type RowType = 'Input' | 'Output' | 'Optional';

class ConditionColumn {
  columnDef: string;
  header: string;
  cell?: Function;

  constructor (columnDef: string, header: string, cell?: Function) {
    this.columnDef = columnDef;
    this.header = header;
    if (cell) {
      this.cell = cell;
    } else {
      this.cell = (condition: Condition) => +this.header > 0 ? condition.rules[+this.header - 1] : '';
    }
  }

  update = (condition: Condition, event: any) => {
    // noinspection JSDeprecatedSymbols
    const newValue: string = event.srcElement.value;
    if (this.columnDef === 'allowed') {
      condition.allowedValues = newValue;
    } else if (+this.header > 0) {
      condition.rules[+this.header - 1] = newValue;
    } else if (this.header !== 'No.') {
      condition.name = newValue;
    }
  }
}

class ConditionColumnsData {
  columns: ConditionColumn[];

  constructor (nameHeader: string) {
    this.columns = [];
    this.columns.push(new ConditionColumn('position', 'No.', (condition: Condition) => `${condition.position}`));
    this.columns.push(new ConditionColumn('name', nameHeader, (condition: Condition) => `${condition.name}`));
    this.columns.push(new ConditionColumn('allowed', 'Allowed values', (condition: Condition) => `${condition.allowedValues}`));
  }

  addRule = () => {
    const currentIndex: number = this.columns.length - 2;
    const ruleColumn: ConditionColumn = new ConditionColumn('rule' + currentIndex, '' + currentIndex);
    this.columns.push(ruleColumn);
  };

  deleteColumn = (column: ConditionColumn) => {
    const index: number = +column.header + 2;
    this.columns.splice(index, 1);
    if (index < this.columns.length) {
      for (let i = index; i < this.columns.length; i++) {
        this.columns[i].header = '' + (+this.columns[i].header - 1);
        this.columns[i].columnDef = 'rule' + this.columns[i].header;
      }
    }
  };

  getDisplayedColumns = () => {
    return this.columns.map(c => c.columnDef);
  }
}

class Condition {
  position?: number;
  name = '';
  allowedValues = '';
  rules: string[] = [];
  type: RowType = 'Input';

  constructor (rules: string[] = [], name: string = '', type: RowType = 'Input', allowedValues: string = '', position?: number) {
    this.rules = rules;
    this.name = name;
    this.type = type;
    this.position = position;
    this.allowedValues = allowedValues;
  }
}

class ConditionsData {
  conditions: Condition[];

  constructor () {
    this.conditions = [];
  }

  add (condition: Condition) {
    condition.position = this.conditions.length + 1;
    this.conditions.push(condition);
  }

  addEmpty (type: RowType = 'Input') {
    if (this.conditions.length === 0) {
      this.add(new Condition([], '', type));
    } else {
      const rules: string[] = [];
      for (let i = 0; i < this.conditions[this.conditions.length - 1].rules.length; i++) {
        rules.push('');
      }
      this.add(new Condition(rules, '', type));
    }
  }

  addEmptyRule () {
    this.conditions.forEach((condition: Condition) => condition.rules.push(''));
  }

  deleteRule = (column: ConditionColumn) => {
    const index: number = +column.header - 1;
    if (index < this.conditions[0].rules.length) {
      this.conditions.forEach((condition: Condition) => condition.rules.splice(index, 1));
    }
  };

  deleteCondition = (condition: Condition) => {
    const index = condition.position - 1;
    this.conditions.splice(index, 1);
    for (let i = index; i < this.conditions.length; i++) {
      this.conditions[i].position = this.conditions[i].position - 1;
    }
  };
}

export class RuleDataSource extends DataSource<any> {
  data: any;

  constructor (data: Condition[]) {
    super();
    this.data = data;
  }

  connect(): Observable<Element[]> {
    return of(this.data);
  }

  disconnect() {}
}


@Component({
  selector: 'app-decision-table',
  templateUrl: './decision-table.component.html',
  styleUrls: ['./decision-table.component.scss']
})
export class DecisionTableComponent implements OnInit, OnDestroy {
  valuesPresent = false;
  outputsPresent = false;
  outputsButtonVisible = false;
  insertButtonVisible = false;
  bounceOutButton = false;
  helpVisible = true;
  editable = false;
  fullscreen = false;
  rowType: RowType = 'Input';
  selectedHitPolicy: string;
  tableName = 'Example name';
  schemaId: string;
  navbarSubscription: Subscription;
  conditionsData: ConditionsData = new ConditionsData();
  valuesData: ConditionsData = new ConditionsData();
  outputsData: ConditionsData = new ConditionsData();
  conditionDataSource: RuleDataSource;
  valuesDataSource: RuleDataSource;
  outputsDataSource: RuleDataSource;
  conditionColumnsData: ConditionColumnsData = new ConditionColumnsData('Condition \\ Rules');
  hitPolicies: SelectOption[] = [
    { key: '0', value: 'Unique' },
    { key: '1', value: 'Any' },
    { key: '2', value: 'Priority' },
    { key: '3', value: 'First' },
    { key: '4', value: 'Collect' },
    { key: '5', value: 'Output order' },
    { key: '6', value: 'Rule order' }
  ];
  rowTypes: string[] = ['Input', 'Output', 'Optional'];

  constructor(private decisionTableService: DecisionTableService) {
    this.prepareMock(); // TODO remove
    this.conditionDataSource = new RuleDataSource(this.conditionsData.conditions);
    this.valuesDataSource = new RuleDataSource(this.valuesData.conditions);
    this.navbarSubscription = this.decisionTableService.getMessage()
      .subscribe((message: 'help' | 'edit') => this.executeAction(message));
  }

  ngOnDestroy(): void {
    this.navbarSubscription.unsubscribe();
  }

  ngOnInit() {
  }

  saveTable = () => {
    this.decisionTableService.addSchema(this.buildSchemaDto())
      .subscribe(response => {
        this.insertButtonVisible = true;
        this.valuesPresent = false;
        this.outputsPresent = false;
        this.schemaId = response.schemaId;
      });
  };

  closeHelp = () => {
    this.helpVisible = false;
  };

  addCondition = () => {
    this.conditionsData.addEmpty(this.rowType);
    this.conditionDataSource = new RuleDataSource(this.conditionsData.conditions);
  };

  addRule = () => {
    this.conditionsData.addEmptyRule();
    this.conditionDataSource = new RuleDataSource(this.conditionsData.conditions);
    this.conditionColumnsData.addRule();
  };

  deleteColumn = (column: ConditionColumn) => {
    this.conditionColumnsData.deleteColumn(column);
    this.conditionsData.deleteRule(column);
  };

  deleteRow = (row: Condition) => {
    this.conditionsData.deleteCondition(row);
    this.conditionDataSource = new RuleDataSource(this.conditionsData.conditions);
  };

  getSelectedHitPolicyName = (): string => {
    const foundPolicy = this.hitPolicies.find((policy: SelectOption) => policy.key === this.selectedHitPolicy);
    return foundPolicy ? foundPolicy.value : 'None';
  };

  buildValueTable = () => {
    this.bounceOutButton = true;
    setTimeout(() => { this.valuesPresent = true; this.insertButtonVisible = false; this.bounceOutButton = false; }, 700);
    this.valuesData.conditions = _.cloneDeep(this.conditionsData.conditions.filter(condition => condition.type === 'Input'));
    this.valuesData.conditions.forEach(condition => condition.rules = condition.rules.map(() => ''));
    this.valuesDataSource = new RuleDataSource(this.valuesData.conditions);
  };

  getOutputs = () => {
    this.bounceOutButton = true;
    setTimeout(() => { this.outputsPresent = true; this.outputsButtonVisible = false; this.bounceOutButton = false; }, 700);
    const valuesByInput: { [key: string]: RulesWithAllowedValues } = {};
    this.valuesData.conditions.forEach(condition => {
      valuesByInput[condition.name] = { allowedValues: condition.allowedValues, values: condition.rules };
    });
    const valuesDto: ValuesDTO = { columnCount: this.conditionsData.conditions[0].rules.length, valuesByInput };
    this.decisionTableService.addValuesFor(this.schemaId, valuesDto)
      .subscribe(response => this.buildOutputTable(response.valuesByOutput));
  };

  updateSchemaCell = (column: ConditionColumn, row: Condition, event: any) => {
    column.update(row, event);
  };

  updateValueCell = (column: ConditionColumn, row: Condition, event: any) => {
    this.outputsButtonVisible = true;
    column.update(row, event);
  };

  private buildOutputTable = (valuesByOutput: { [key: string]: string[] }) => {
    this.outputsData.conditions = [];
    Object.keys(valuesByOutput).forEach((output: string) => {
      const foundRow = this.conditionsData.conditions.find(condition => condition.name === output);
      this.outputsData.add(new Condition(valuesByOutput[output], output, 'Output', foundRow ? foundRow.allowedValues : ''));
    });
    this.outputsDataSource = new RuleDataSource(this.outputsData.conditions);
  };

  private buildSchemaDto (): CreateSchemaDTO {
    return {
      tableName: this.tableName,
      hitPolicy: this.getSelectedHitPolicyName(),
      columnCount: this.conditionsData.conditions[0].rules.length,
      rulesByInput: this.getRulesBy('Input'),
      rulesByOutput: this.getRulesBy('Output'),
      rulesByOptional: this.getRulesBy('Optional')
    };
  }

  private getRulesBy = (rowType: RowType): { [key: string]: RulesWithAllowedValues } => {
    const rulesByRowType: { [key: string]: RulesWithAllowedValues } = {};
    this.conditionsData.conditions.filter(condition => condition.type === rowType)
      .forEach(condition => rulesByRowType[condition.name] = { allowedValues: condition.allowedValues, values: condition.rules });
    return rulesByRowType;
  };

  private executeAction(message: DecisionTableMessage) {
    if (message === 'edit') {
      if (this.editable) {
        this.saveTable();
      }
      this.editable = !this.editable;
    } else if (message === 'help') {
      this.helpVisible = true;
    } else if (message === 'fullscreen') {
      this.fullscreen = !this.fullscreen;
    }
  }

  // TODO remove
  private prepareMock () {
    for (let i = 0; i < 3; i++) {
      this.conditionColumnsData.addRule();
    }
    this.conditionsData.add(new Condition(['<5', '-', '>=5'], 'Package size', 'Input', '<5,>=5'));
    this.conditionsData.add(new Condition(['<10', '>=10', '-'], 'Order size', 'Input', '<10,>=10'));
    this.conditionsData.add(new Condition(['0.10', '0.15', '0.05'], 'Discount', 'Output', '0.05,0.10,0.15'));
    this.conditionsData.add(new Condition(['Desc1', 'Desc2', 'Desc3'], 'Description', 'Optional'));
    this.conditionsData.add(new Condition(['Ref1', 'Ref2', 'Ref3'], 'Reference', 'Optional'));
  }

}
