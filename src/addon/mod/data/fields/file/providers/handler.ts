// (C) Copyright 2015 Martin Dougiamas
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { Injector, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CoreFileSessionProvider } from '@providers/file-session';
import { AddonModDataFieldHandler } from '../../../providers/fields-delegate';
import { AddonModDataProvider } from '../../../providers/data';
import { AddonModDataFieldFileComponent } from '../component/file';
import { CoreFileUploaderProvider } from '@core/fileuploader/providers/fileuploader';

/**
 * Handler for file data field plugin.
 */
@Injectable()
export class AddonModDataFieldFileHandler implements AddonModDataFieldHandler {
    name = 'AddonModDataFieldFileHandler';
    type = 'file';

    constructor(private translate: TranslateService, private fileSessionprovider: CoreFileSessionProvider,
        private fileUploaderProvider: CoreFileUploaderProvider) { }

    /**
     * Return the Component to use to display the plugin data.
     * It's recommended to return the class of the component, but you can also return an instance of the component.
     *
     * @param {Injector} injector Injector.
     * @param {any} field         The field object.
     * @return {any|Promise<any>} The component (or promise resolved with component) to use, undefined if not found.
     */
    getComponent(injector: Injector, plugin: any): any | Promise<any> {
        return AddonModDataFieldFileComponent;
    }

    /**
     * Get field search data in the input data.
     *
     * @param  {any} field      Defines the field to be rendered.
     * @param  {any} inputData  Data entered in the search form.
     * @return {any}            With name and value of the data to be sent.
     */
    getFieldSearchData(field: any, inputData: any): any {
        const fieldName = 'f_' + field.id;

        if (inputData[fieldName]) {
            return [{
                name: fieldName,
                value: inputData[fieldName]
            }];
        }

        return false;
    }

    /**
     * Get field edit data in the input data.
     *
     * @param  {any} field      Defines the field to be rendered.
     * @param  {any} inputData  Data entered in the edit form.
     * @return {any}            With name and value of the data to be sent.
     */
    getFieldEditData(field: any, inputData: any, originalFieldData: any): any {
        const files = this.getFieldEditFiles(field);

        return [{
            fieldid: field.id,
            subfield: 'file',
            files: files
        }];
    }

    /**
     * Get field edit files in the input data.
     *
     * @param  {any} field        Defines the field..
     * @return {any}             With name and value of the data to be sent.
     */
    getFieldEditFiles(field: any): any {
        return this.fileSessionprovider.getFiles(AddonModDataProvider.COMPONENT,  field.dataid + '_' + field.id);
    }

    /**
     * Get field data in changed.
     *
     * @param  {any} field                  Defines the field to be rendered.
     * @param  {any} inputData              Data entered in the edit form.
     * @param  {any} originalFieldData      Original field entered data.
     * @return {Promise<boolean> | boolean} If the field has changes.
     */
    hasFieldDataChanged(field: any, inputData: any, originalFieldData: any): Promise<boolean> | boolean {
        const files = this.fileSessionprovider.getFiles(AddonModDataProvider.COMPONENT,  field.dataid + '_' + field.id) || [];
        let originalFiles = (originalFieldData && originalFieldData.files) || [];

        if (originalFiles.length) {
            originalFiles = [originalFiles[0]];
        }

        return this.fileUploaderProvider.areFileListDifferent(files, originalFiles);
    }

    /**
     * Check and get field requeriments.
     *
     * @param  {any} field               Defines the field to be rendered.
     * @param  {any} inputData           Data entered in the edit form.
     * @return {string | false}                  String with the notification or false.
     */
    getFieldsNotifications(field: any, inputData: any): string | false {
        if (field.required && (!inputData || !inputData.length || !inputData[0].value)) {
            return this.translate.instant('addon.mod_data.errormustsupplyvalue');
        }

        return false;
    }

    /**
     * Override field content data with offline submission.
     *
     * @param  {any}  originalContent    Original data to be overriden.
     * @param  {any}  offlineContent     Array with all the offline data to override.
     * @param  {any}  [offlineFiles]     Array with all the offline files in the field.
     * @return {any}                     Data overriden
     */
    overrideData(originalContent: any, offlineContent: any, offlineFiles?: any): any {
        if (offlineContent && offlineContent.file && offlineContent.file.offline > 0 && offlineFiles && offlineFiles.length > 0) {
            originalContent.content = offlineFiles[0].filename;
            originalContent.files = [offlineFiles[0]];
        } else if (offlineContent && offlineContent.file && offlineContent.file.online && offlineContent.file.online.length > 0) {
            originalContent.content = offlineContent.file.online[0].filename;
            originalContent.files = [offlineContent.file.online[0]];
        }

        return originalContent;
    }

    /**
     * Whether or not the handler is enabled on a site level.
     *
     * @return {boolean|Promise<boolean>} True or promise resolved with true if enabled.
     */
    isEnabled(): boolean | Promise<boolean> {
        return true;
    }
}
