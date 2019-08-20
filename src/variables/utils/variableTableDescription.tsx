// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { ReactWidget } from '@jupyterlab/apputils';

import { ArrayExt } from '@phosphor/algorithm';

import { Widget, Panel } from '@phosphor/widgets';

import React, { useState } from 'react';

import { IVariablesModel } from '../model';

import { VariablesSearch } from './toggle';

import useTbody from './useTbody';

const ROW_CLASS = 'jp-DebuggerSidebarVariables-table-row';

const HEAD_CLASS = 'jp-DebuggerSidebarVariables-table-head';

const Table = ({ model }: { model: IVariablesModel }) => {
  const [variables, setVariables] = useState(model.variables);
  const [variable, TableBody] = useTbody(variables, model.current, ROW_CLASS);

  model.variablesChanged.connect((_: any, updates) => {
    if (ArrayExt.shallowEqual(variables, updates)) {
      return;
    }
    setVariables(updates);
  });

  model.current = variable;
  return (
    <table>
      <thead>
        <tr>
          <th style={{ width: '25%' }} className={HEAD_CLASS}>
            Name
          </th>
          <th style={{ width: '75%' }} className={HEAD_CLASS}>
            Value
          </th>
        </tr>
      </thead>
      <TableBody />
    </table>
  );
};

class TableVariableWidget extends ReactWidget {
  state: IVariablesModel;

  constructor(props: any) {
    super(props);
    this.state = props;
  }

  render() {
    return <Table model={this.state} />;
  }
}

export class VariableTableDescription extends Panel {
  private _model: IVariablesModel;
  private searchParams: Widget;
  private myWidget: Widget;
  constructor(model: IVariablesModel) {
    super();
    this._model = model;
    this.searchParams = new VariablesSearch(this._model);
    this.addWidget(this.searchParams);
    this.myWidget = new TableVariableWidget(this._model);
    this.addWidget(this.myWidget);
  }

  protected onResize(msg: Widget.ResizeMessage): void {
    super.onResize(msg);
    this.resizeBody(msg);
  }

  protected getBody() {
    if (this.myWidget && this.myWidget.node && this.myWidget.node.childNodes) {
      return (
        (this.myWidget.node.children[0].children[1] as HTMLElement) || null
      );
    }
  }

  protected getHead() {
    if (this.myWidget && this.myWidget.node && this.myWidget.node.childNodes) {
      return (
        (this.myWidget.node.children[0].children[0] as HTMLElement) || null
      );
    }
  }

  protected resizeBody(msg: Widget.ResizeMessage): void {
    const head = this.getHead();
    const body = this.getBody();
    if (body && head) {
      const totalHeight = msg.height;
      const headHeight = head.offsetHeight;
      const bodyHeight = totalHeight - headHeight - 20;
      body.style.height = `${bodyHeight}px`;
    }
  }
}
