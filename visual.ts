/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

module powerbi.extensibility.visual {
    "use strict";
    export class Visual implements IVisual {
        private element: HTMLElement;
        private selectionManager: ISelectionManager;
        private selectionIds: any = {};
        private host: IVisualHost;
        private isEventUpdate: boolean = false;

        constructor(options: VisualConstructorOptions) {
            this.element = options.element;
            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
        }

        public update(options: VisualUpdateOptions) {
            if (options.type & VisualUpdateType.Data && !this.isEventUpdate) {
                this.init(options);
            }
        }

        public init(options: VisualUpdateOptions) {

            // Return if we don't have a category
            if (!options ||
                !options.dataViews ||
                !options.dataViews[0] ||
                !options.dataViews[0].categorical ||
                !options.dataViews[0].categorical.categories ||
                !options.dataViews[0].categorical.categories[0]) {
                return;
            }

            // remove any children from previous renders
            while (this.element.firstChild) {
                this.element.removeChild(this.element.firstChild);
            }

            // clear out any previous selection ids
            this.selectionIds = {};

            // get the category data.
            let category = options.dataViews[0].categorical.categories[0];
            let values = category.values;

            //Create and append select list
            let ddl = document.createElement("select");
            ddl.className = 'form-control';

            ddl.onchange = function (ev) {
                    this.isEventUpdate = true; // This is checked in the update method. If true it won't re-render, this prevents and infinite loop
                    this.selectionManager.clear(); // Clean up previous filter before applying another one.
                    debugger;
                    // Find the selectionId and select it
                    this.selectionManager.select(this.selectionIds[ev.target.value]).then((ids: ISelectionId[]) => {
                        ids.forEach(function (id) {
                            console.log(id);
                        });
                    });

                    // This call applys the previously selected selectionId
                    this.selectionManager.applySelectionFilter();
                }.bind(this);
         

            // build selection ids to be used by filtering capabilities later
            values.forEach((item: number, index: number) => {

                // create an in-memory version of the selection id so it can be used in onclick event.
                this.selectionIds[item] = this.host.createSelectionIdBuilder()
                    .withCategory(category, index)
                    .createSelectionId();

                //debugger;
                let value = item.toString();
                let option = document.createElement("option");
                option.value = value;
                option.text = value;
  
                ddl.appendChild(option);

                
            })

            this.element.appendChild(ddl);

          
        }
    }
}