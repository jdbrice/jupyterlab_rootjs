import {

    DocumentRegistry
} from '@jupyterlab/docregistry'
import { JupyterFrontEnd } from '@jupyterlab/application';
import {
    INotebookModel,
    NotebookPanel
} from '@jupyterlab/notebook'

import {
    JupyterFrontEndPlugin
} from '@jupyterlab/application'

import {
    IDisposable,
    DisposableDelegate
} from '@phosphor/disposable'

import {
    ROOTJSExec,
    ROOTJSLoad,
    ROOT_EXEC_MIME_TYPE,
    ROOT_LOAD_MIME_TYPE
} from './renderer'

export
    type INBWidgetExtension = DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>;


export
    class NBWidgetExtension implements INBWidgetExtension {
    createNew(nb: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {

        nb.content.rendermime.addFactory({
            safe: false,
            mimeTypes: [ROOT_LOAD_MIME_TYPE],
            defaultRank: -1,
            createRenderer: options => new ROOTJSLoad(options)
        }, -1);

        nb.content.rendermime.addFactory({
            safe: false,
            mimeTypes: [ROOT_EXEC_MIME_TYPE],
            defaultRank: -1,
            createRenderer: options => new ROOTJSExec(options)
        }, -1);

        return new DisposableDelegate(() => {
            if (nb.content.rendermime) {
                nb.content.rendermime.removeMimeType(ROOT_EXEC_MIME_TYPE);
            }
        });
    }
}

export
    const extension: JupyterFrontEndPlugin<void> = {
        id: 'jupyterlab_rootjs',
        autoStart: true,
        activate: (app: JupyterFrontEnd) => {
            // this adds the HoloViews widget extension onto Notebooks specifically
            app.docRegistry.addWidgetExtension('Notebook', new NBWidgetExtension());
            console.log( "jupyterlab_rootjs is actiavted" )
        }
    }
