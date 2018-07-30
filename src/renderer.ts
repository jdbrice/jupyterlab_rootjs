import {
    IRenderMime
} from '@jupyterlab/rendermime-interfaces'

import {
    Widget
} from '@phosphor/widgets'

import {
    ReadonlyJSONObject
} from '@phosphor/coreutils'

// import * as requirejs from 'requirejs';

const HTML_MIME_TYPE = 'text/html'
const JS_MIME_TYPE = 'application/javascript'
export const ROOT_LOAD_MIME_TYPE = 'application/vnd.rootjs_load.v0+json'
export const ROOT_EXEC_MIME_TYPE = 'application/vnd.rootjs_exec.v0+json'


/**
 * Load HVJS and CSS into the DOM
 */
export
    class ROOTJSLoad extends Widget implements IRenderMime.IRenderer {
    private _load_mimetype: string = ROOT_LOAD_MIME_TYPE
    private _script_element: HTMLScriptElement

    constructor(options: IRenderMime.IRendererOptions) {
        super();
        this._script_element = document.createElement("script");
        // (window as any).requirejs = requirejs;
        // (window as any).jQuery = jquery;
        // (window as any).$ = jquery;
    }

    renderModel(model: IRenderMime.IMimeModel): Promise<void> {
        console.log( "LOAD!" );
        let data = model.data[this._load_mimetype] as string;
        console.log( data );

        // load require js on first pass
        let that:ROOTJSLoad = this;
        this._script_element.onload = function () {
            that._script_element = document.createElement("script");
            that._script_element.textContent = data;
            that.node.appendChild(that._script_element)
            console.log("requireJS configured");
        };

        this._script_element.src = "https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.5/require.js";
        this.node.appendChild(this._script_element)
        

        return Promise.resolve();
    } // renderModel
} //ROOTJSLoad


/**
 * Exec HVJS in window
 */
export
    class ROOTJSExec extends Widget implements IRenderMime.IRenderer {
    // for classic nb compat reasons, the payload in contained in these mime messages
    // private _html_mimetype: string = HTML_MIME_TYPE
    private _js_mimetype: string = JS_MIME_TYPE
    // the metadata is stored here
    private _document_id: string
    private _exec_mimetype: string = ROOT_EXEC_MIME_TYPE
    private _script_element: HTMLScriptElement
    private _div_element: HTMLDivElement
    // private _manager: ContextManager;
    private _displayed: boolean;
    private _disposedPlot: boolean;

    constructor(options: IRenderMime.IRendererOptions ) {
        super()
        this._createNodes();
        this._displayed = false;
        this._disposedPlot = false;
    }

    _createNodes(): void {
        this._div_element = document.createElement("div")
        this._script_element = document.createElement("script")
        this._script_element.setAttribute('type', 'text/javascript');
    }

    get isDisposed(): boolean {
        return this._disposedPlot === true;
    }

    renderModel(model: IRenderMime.IMimeModel): Promise<void> {
        console.log( "EXEC!" );
        let metadata = model.metadata[this._exec_mimetype] as ReadonlyJSONObject
        const id = metadata.id as string;
        const cw = metadata.width as string;
        const ch = metadata.height as string;

        if (this._displayed) {
            this._disposePlot()
            this.node.removeChild(this._div_element);
            this.node.removeChild(this._script_element);
            this._createNodes()
        }

        if (id !== undefined) {
            console.log( "ID is : ", id );

            // do we need to make the DIV?
            if ( HTML_MIME_TYPE in model.data ){
                console.log( "ROOTJS: creating DIV for canvas, id=", id )
                this._div_element.id = id;
                this._div_element.style.width = cw + 'px';
                this._div_element.style.height = ch + 'px';
                // this._div_element.setAttribute("style", "width:" + cw + "px");
                // this._div_element.setAttribute("style", "height:" + ch + "px");
                this.node.appendChild(this._div_element);
            }

            let data = model.data[this._js_mimetype] as string;
            if ( "" != data ){
                this._script_element.textContent = data;
                this.node.appendChild(this._script_element);

                this._displayed = true;
                this._document_id = id;
            } else {
                // just adding the figure
            }
        }

        return Promise.resolve()
    } // renderModel

    _disposePlot(): void {
        const id = this._document_id;
        if (id !== null) {
            this._document_id = null;
        }
    this._disposedPlot = false;
    } // _disposePlot

    dispose(): void {
        if (this.isDisposed) {
            return;
        }
        this._disposePlot();
        this._disposedPlot = false;
    } // dispose
} // ROOTJSExec