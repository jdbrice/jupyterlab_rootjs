import {
    DocumentRegistry
} from '@jupyterlab/docregistry'

import {
    INotebookModel,
    NotebookPanel
} from '@jupyterlab/notebook'

import {
    JupyterLabPlugin,
    JupyterLab
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
        // let manager = new ContextManager(context);

        nb.rendermime.addFactory({
            safe: false,
            mimeTypes: [ROOT_LOAD_MIME_TYPE],
            createRenderer: (options) => new ROOTJSLoad(options)
        }, -1);

        nb.rendermime.addFactory({
            safe: false,
            mimeTypes: [ROOT_EXEC_MIME_TYPE],
            createRenderer: (options) => new ROOTJSExec(options)
        }, -1);

        return new DisposableDelegate(() => {
            if (nb.rendermime) {
                nb.rendermime.removeMimeType(ROOT_EXEC_MIME_TYPE);
            }
            // manager.dispose();
        });
    }
}

export
    const extension: JupyterLabPlugin<void> = {
        id: 'jupyterlab_rootjs',
        autoStart: true,
        activate: (app: JupyterLab) => {
            // this adds the HoloViews widget extension onto Notebooks specifically
            app.docRegistry.addWidgetExtension('Notebook', new NBWidgetExtension());
            console.log( "jupyterlab_rootjs is actiavted" )
        }
    }
