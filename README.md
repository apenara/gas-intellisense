# Google Apps Script IntelliSense

**Zero-config IntelliSense, autocompletion, and snippets for Google Apps Script development in VS Code.**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**📖 Language / Idioma:** [English](#english) | [Español](#español)

---

<a name="english"></a>

## Features

### 🎯 **Automatic IntelliSense for GAS APIs**

Get instant autocompletion for all Google Apps Script services without any configuration:

- **Core Services:** SpreadsheetApp, GmailApp, DriveApp, CalendarApp, DocumentApp, SlidesApp, FormApp
- **Utility Services:** ScriptApp, PropertiesService, CacheService, UrlFetchApp, Utilities, HtmlService, Logger
- **Advanced Services:** AdminDirectory, Classroom, Analytics, BigQuery, YouTube, and 30+ more

Simply open a `.gs` file and start typing - IntelliSense appears instantly!

### 📝 **Code Snippets**

Speed up development with 28 ready-to-use code snippets for common GAS patterns:

#### Triggers & Entry Points
| Snippet Prefix | Description |
|----------------|-------------|
| `onOpen` | Create an onOpen trigger with custom menu |
| `onEdit` | Create an onEdit trigger with event handling |
| `onInstall` | Setup code when add-on is installed |
| `onSubmit` | Handle Google Form submissions |
| `doGet` | Create a doGet handler for web apps (GET requests) |
| `doPost` | Create a doPost handler for web apps (POST requests) |

#### Spreadsheet Operations
| Snippet Prefix | Description |
|----------------|-------------|
| `getActiveSheet` | Get the active spreadsheet and sheet |
| `getRange` | Get a cell or range using A1 notation |
| `getValues` | Get all values from a range as a 2D array |
| `setValue` | Set a single cell value |
| `appendRow` | Add a new row to the end of the sheet |
| `getDataRange` | Get all data in the sheet (smart range detection) |
| `clearRange` | Clear contents of a cell range |
| `insertSheet` | Create a new sheet in the spreadsheet |
| `deleteSheet` | Delete a sheet by name (with safety check) |

#### Email Operations
| Snippet Prefix | Description |
|----------------|-------------|
| `sendEmail` | Send an email using MailApp |
| `sendEmailHtml` | Send HTML formatted email |
| `sendEmailAttach` | Send email with file attachment from Drive |
| `createDraft` | Create email draft without sending |
| `getUnreadEmails` | Get and process unread emails |
| `replyEmail` | Reply to an email thread |
| `markAsRead` | Mark email threads as read |
| `addLabel` | Add label to email threads |
| `archiveThread` | Archive email threads |

#### Logging & Debugging
| Snippet Prefix | Description |
|----------------|-------------|
| `log` | Quick log message for debugging |
| `logObj` | Pretty-print object for debugging |
| `logArray` | Debug array contents with indices |
| `tryCatch` | Error handling with try-catch |

### ✨ **Enhanced Editing Features**

- **Hover Documentation:** Hover over GAS APIs (SpreadsheetApp, GmailApp, etc.) to see:
  - Method descriptions and usage
  - Direct links to official Google documentation
  - Code examples
- **Signature Help:** View parameter hints as you type function calls
- **Go to Definition:** Jump to type definitions with Ctrl+Click
- **Syntax Highlighting:** Full JavaScript syntax highlighting for `.gs` files

## Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Google Apps Script IntelliSense"
4. Click Install

**Or install from the command line:**
```bash
code --install-extension apenara.gas-intellisense
```

## Quick Start

### 1. Open a `.gs` file

Create or open any Google Apps Script file (`.gs` extension):

```javascript
// test.gs
function myFunction() {

}
```

### 2. Start typing and see IntelliSense

```javascript
function myFunction() {
  SpreadsheetApp. // ← IntelliSense appears here!
}
```

### 3. Try a snippet

Type `onOpen` and press Tab:

```javascript
function onOpen(e) {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Custom Menu')
    .addItem('Menu Item', 'functionName')
    .addToUi();
}
```

## Usage Examples

### Example 1: Sheets Automation

```javascript
function updateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  // IntelliSense helps you discover methods
  sheet.getRange('A1').setValue('Hello World');

  // Hover over methods to see documentation
  const data = sheet.getDataRange().getValues();
}
```

### Example 2: Gmail Integration

```javascript
function processEmails() {
  // IntelliSense shows all GmailApp methods
  const threads = GmailApp.search('is:unread label:inbox');

  threads.forEach(thread => {
    const messages = thread.getMessages();
    // Full type information available
  });
}
```

### Example 3: Drive Operations

```javascript
function listFiles() {
  const folder = DriveApp.getFolderById('folder-id-here');
  const files = folder.getFiles();

  while (files.hasNext()) {
    const file = files.next();
    Logger.log(file.getName());
  }
}
```

## Snippet Examples

Here are some examples of the most commonly used snippets. See the snippets table above for the complete list of 28 available snippets.

### Triggers & Entry Points

**`doPost`** - Web app POST handler
```javascript
function doPost(e) {
  // Handle POST request from form/webhook
  const params = e.postData.contents;
  const data = JSON.parse(params);

  // Process data
  Logger.log(data);

  // Return response
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

**`onSubmit`** - Form submission handler
```javascript
function onFormSubmit(e) {
  // Handle form submission
  const responses = e.values;
  const timestamp = responses[0];

  Logger.log('Form submitted at: ' + timestamp);
  // Process form data
}
```

### Spreadsheet Operations

**`getValues`** - Get range as 2D array
```javascript
const sheet = SpreadsheetApp.getActiveSheet();
const values = sheet.getRange('A1:B10').getValues();

// values is a 2D array: [[row1col1, row1col2], [row2col1, row2col2], ...]
values.forEach(row => {
  Logger.log(row);
});
```

**`appendRow`** - Add new row
```javascript
const sheet = SpreadsheetApp.getActiveSheet();
sheet.appendRow(['value1', 'value2', 'value3']);
```

### Email Operations

**`sendEmailHtml`** - HTML formatted email
```javascript
MailApp.sendEmail({
  to: 'recipient@example.com',
  subject: 'Email Subject',
  body: 'This email requires HTML support.',
  htmlBody: `
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h1>Hello</h1>
        <p>Your message here</p>
      </body>
    </html>
  `
});
```

**`getUnreadEmails`** - Process unread emails
```javascript
const threads = GmailApp.search('is:unread label:inbox', 0, 10);
threads.forEach(thread => {
  const messages = thread.getMessages();
  messages.forEach(message => {
    Logger.log('From: ' + message.getFrom());
    Logger.log('Subject: ' + message.getSubject());
  });
});
```

### Logging & Debugging

**`tryCatch`** - Error handling
```javascript
try {
  // Your code here
} catch (error) {
  Logger.log('Error: ' + error.toString());
  // Handle error
}
```

## Configuration

The extension works out of the box with zero configuration. Optional settings:

```json
{
  "gasIntellisense.enableSnippets": true
}
```

## Requirements

- VS Code 1.80.0 or higher
- No additional dependencies required (no clasp, no npm in your project)

## How It Works

This extension bundles the official `@types/google-apps-script` type definitions and registers `.gs` files with VS Code's JavaScript language server.

When you first open a `.gs` file, the extension will prompt you to set up your workspace for enhanced IntelliSense. If you agree:
1. A `jsconfig.json` file will be created in your workspace
2. Type definitions will be copied to your workspace's `node_modules/@types` folder
3. You'll be prompted to reload VS Code to activate full IntelliSense

**Opt-in by design** - The extension respects your workspace and only makes changes with your permission. You can also manually run the setup anytime using the command palette: `GAS: Setup Workspace`.

**No internet connection required** - all type definitions are bundled with the extension.

## Comparison with Other Tools

| Feature | This Extension | labnol/google-apps-script | Manual clasp setup |
|---------|----------------|---------------------------|-------------------|
| Zero-config IntelliSense | ✅ | ❌ | ❌ |
| GAS-specific snippets | ✅ | ❌ | ❌ |
| Works offline | ✅ | ✅ | ✅ |
| Requires npm/clasp | ❌ | ❌ | ✅ |
| Setup time | 0 min | 0 min | 15+ min |

## Limitations

This extension focuses solely on **IntelliSense and code editing**. It does not:

- ❌ Sync code with Google Apps Script (use [clasp](https://github.com/google/clasp) for this)
- ❌ Execute or deploy scripts (use clasp or the web editor)
- ❌ Create new GAS projects (use clasp)

**This is by design** - the extension does one thing well: improve your coding experience.

## Troubleshooting

### Didn't see the setup prompt?

If you missed the initial setup prompt or clicked "No":
1. Open the command palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Type "GAS: Setup Workspace"
3. Press Enter to run the manual setup

### IntelliSense not appearing?

1. Make sure the file has a `.gs` extension
2. Check if workspace setup has been completed (look for `jsconfig.json` in your workspace)
3. If not set up, run "GAS: Setup Workspace" from the command palette
4. Try reloading VS Code (Ctrl+Shift+P → "Developer: Reload Window")
5. Check that the extension is activated (Extensions panel → GAS IntelliSense should show as active)

### Snippets not working?

1. Check that `gasIntellisense.enableSnippets` is set to `true` (default)
2. Make sure you're in a JavaScript context (.gs file)
3. Type the snippet prefix and press Tab or Enter

### Setup prompt appearing repeatedly?

This shouldn't happen, but if it does:
1. Check if `jsconfig.json` or `tsconfig.json` exists in your workspace
2. Try running "GAS: Setup Workspace" manually to complete setup
3. If the issue persists, try reloading VS Code

### Types seem outdated?

The extension uses `@types/google-apps-script` v2.0.7 (latest as of October 2025). Future updates will include newer versions.

## Roadmap

### Phase 2 (Current Release)
- [x] 23 additional code snippets (exceeds goal of 15+)
- [x] Custom hover provider with links to Google documentation
- [ ] Enhanced signature help with examples
- [ ] Extension icon and branding

### Phase 3 (Future)
- [ ] More snippets for Drive, Calendar, Forms, and Documents
- [ ] Integration with clasp for push/pull
- [ ] Linter rules for common GAS mistakes
- [ ] Project templates and scaffolding
- [ ] AI-powered code generation

## Contributing

Contributions are welcome! Please feel free to:

- Report bugs via [GitHub Issues](https://github.com/apenara/gas-intellisense/issues)
- Submit feature requests
- Contribute code via Pull Requests
- Share your feedback

## Related Resources

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [clasp - Command Line Apps Script Projects](https://github.com/google/clasp)
- [@types/google-apps-script on npm](https://www.npmjs.com/package/@types/google-apps-script)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Issues:** [GitHub Issues](https://github.com/apenara/gas-intellisense/issues)
- **Discussions:** [GitHub Discussions](https://github.com/apenara/gas-intellisense/discussions)
- **Buy me a coffee:** ☕ [buymeacoffee.com/apenaravan](https://buymeacoffee.com/apenaravan)

## Acknowledgments

- Built on top of [@types/google-apps-script](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/google-apps-script) by the DefinitelyTyped community
- Inspired by the need for better Google Apps Script development tools

---

**Made with ❤️ by Alfonso Peñaranda van Bommel for the Google Apps Script community**

If this extension helps you, please consider:
- ⭐ Starring the repository
- 📝 Leaving a review on the marketplace
- 📢 Sharing with other GAS developers
- ☕ [Buying me a coffee](https://buymeacoffee.com/apenaravan)

---
---

<a name="español"></a>

# Google Apps Script IntelliSense

**IntelliSense, autocompletado y snippets sin configuración para desarrollo de Google Apps Script en VS Code.**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**📖 Language / Idioma:** [English](#english) | [Español](#español)

---

## Características

### 🎯 **IntelliSense Automático para APIs de GAS**

Obtén autocompletado instantáneo para todos los servicios de Google Apps Script sin ninguna configuración:

- **Servicios Principales:** SpreadsheetApp, GmailApp, DriveApp, CalendarApp, DocumentApp, SlidesApp, FormApp
- **Servicios de Utilidad:** ScriptApp, PropertiesService, CacheService, UrlFetchApp, Utilities, HtmlService, Logger
- **Servicios Avanzados:** AdminDirectory, Classroom, Analytics, BigQuery, YouTube, y más de 30 servicios adicionales

¡Simplemente abre un archivo `.gs` y comienza a escribir - IntelliSense aparece instantáneamente!

### 📝 **Snippets de Código**

Acelera el desarrollo con 28 snippets listos para usar para patrones comunes de GAS:

#### Triggers y Puntos de Entrada
| Prefijo del Snippet | Descripción |
|---------------------|-------------|
| `onOpen` | Crear un trigger onOpen con menú personalizado |
| `onEdit` | Crear un trigger onEdit con manejo de eventos |
| `onInstall` | Código de configuración cuando se instala el complemento |
| `onSubmit` | Manejar envíos de Formularios de Google |
| `doGet` | Crear un manejador doGet para aplicaciones web (peticiones GET) |
| `doPost` | Crear un manejador doPost para aplicaciones web (peticiones POST) |

#### Operaciones de Hojas de Cálculo
| Prefijo del Snippet | Descripción |
|---------------------|-------------|
| `getActiveSheet` | Obtener la hoja de cálculo y hoja activa |
| `getRange` | Obtener una celda o rango usando notación A1 |
| `getValues` | Obtener todos los valores de un rango como array 2D |
| `setValue` | Establecer el valor de una sola celda |
| `appendRow` | Agregar una nueva fila al final de la hoja |
| `getDataRange` | Obtener todos los datos de la hoja (detección inteligente de rango) |
| `clearRange` | Limpiar el contenido de un rango de celdas |
| `insertSheet` | Crear una nueva hoja en la hoja de cálculo |
| `deleteSheet` | Eliminar una hoja por nombre (con verificación de seguridad) |

#### Operaciones de Correo Electrónico
| Prefijo del Snippet | Descripción |
|---------------------|-------------|
| `sendEmail` | Enviar un correo electrónico usando MailApp |
| `sendEmailHtml` | Enviar correo electrónico con formato HTML |
| `sendEmailAttach` | Enviar correo con archivo adjunto desde Drive |
| `createDraft` | Crear borrador de correo sin enviar |
| `getUnreadEmails` | Obtener y procesar correos no leídos |
| `replyEmail` | Responder a un hilo de correo |
| `markAsRead` | Marcar hilos de correo como leídos |
| `addLabel` | Agregar etiqueta a hilos de correo |
| `archiveThread` | Archivar hilos de correo |

#### Registro y Depuración
| Prefijo del Snippet | Descripción |
|---------------------|-------------|
| `log` | Mensaje de registro rápido para depuración |
| `logObj` | Imprimir objeto de forma legible para depuración |
| `logArray` | Depurar contenido de array con índices |
| `tryCatch` | Manejo de errores con try-catch |

### ✨ **Características Mejoradas de Edición**

- **Documentación al Pasar el Cursor:** Pasa el cursor sobre APIs de GAS (SpreadsheetApp, GmailApp, etc.) para ver:
  - Descripciones de métodos y uso
  - Enlaces directos a la documentación oficial de Google
  - Ejemplos de código
- **Ayuda de Firma:** Ver sugerencias de parámetros mientras escribes llamadas a funciones
- **Ir a Definición:** Saltar a definiciones de tipos con Ctrl+Click
- **Resaltado de Sintaxis:** Resaltado completo de sintaxis JavaScript para archivos `.gs`

## Instalación

1. Abre VS Code
2. Ve a Extensiones (Ctrl+Shift+X)
3. Busca "Google Apps Script IntelliSense"
4. Haz clic en Instalar

**O instala desde la línea de comandos:**
```bash
code --install-extension apenara.gas-intellisense
```

## Inicio Rápido

### 1. Abre un archivo `.gs`

Crea o abre cualquier archivo de Google Apps Script (extensión `.gs`):

```javascript
// test.gs
function myFunction() {

}
```

### 2. Comienza a escribir y ve IntelliSense

```javascript
function myFunction() {
  SpreadsheetApp. // ← ¡IntelliSense aparece aquí!
}
```

### 3. Prueba un snippet

Escribe `onOpen` y presiona Tab:

```javascript
function onOpen(e) {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Custom Menu')
    .addItem('Menu Item', 'functionName')
    .addToUi();
}
```

## Ejemplos de Uso

### Ejemplo 1: Automatización de Hojas

```javascript
function updateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  // IntelliSense te ayuda a descubrir métodos
  sheet.getRange('A1').setValue('Hola Mundo');

  // Pasa el cursor sobre métodos para ver documentación
  const data = sheet.getDataRange().getValues();
}
```

### Ejemplo 2: Integración con Gmail

```javascript
function processEmails() {
  // IntelliSense muestra todos los métodos de GmailApp
  const threads = GmailApp.search('is:unread label:inbox');

  threads.forEach(thread => {
    const messages = thread.getMessages();
    // Información completa de tipos disponible
  });
}
```

### Ejemplo 3: Operaciones de Drive

```javascript
function listFiles() {
  const folder = DriveApp.getFolderById('folder-id-here');
  const files = folder.getFiles();

  while (files.hasNext()) {
    const file = files.next();
    Logger.log(file.getName());
  }
}
```

## Ejemplos de Snippets

Aquí hay algunos ejemplos de los snippets más utilizados. Consulta la tabla de snippets arriba para la lista completa de 28 snippets disponibles.

### Triggers y Puntos de Entrada

**`doPost`** - Manejador POST de aplicación web
```javascript
function doPost(e) {
  // Manejar petición POST desde formulario/webhook
  const params = e.postData.contents;
  const data = JSON.parse(params);

  // Procesar datos
  Logger.log(data);

  // Devolver respuesta
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

**`onSubmit`** - Manejador de envío de formulario
```javascript
function onFormSubmit(e) {
  // Manejar envío de formulario
  const responses = e.values;
  const timestamp = responses[0];

  Logger.log('Formulario enviado en: ' + timestamp);
  // Procesar datos del formulario
}
```

### Operaciones de Hojas de Cálculo

**`getValues`** - Obtener rango como array 2D
```javascript
const sheet = SpreadsheetApp.getActiveSheet();
const values = sheet.getRange('A1:B10').getValues();

// values es un array 2D: [[row1col1, row1col2], [row2col1, row2col2], ...]
values.forEach(row => {
  Logger.log(row);
});
```

**`appendRow`** - Agregar nueva fila
```javascript
const sheet = SpreadsheetApp.getActiveSheet();
sheet.appendRow(['valor1', 'valor2', 'valor3']);
```

### Operaciones de Correo Electrónico

**`sendEmailHtml`** - Correo con formato HTML
```javascript
MailApp.sendEmail({
  to: 'destinatario@ejemplo.com',
  subject: 'Asunto del Correo',
  body: 'Este correo requiere soporte HTML.',
  htmlBody: `
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h1>Hola</h1>
        <p>Tu mensaje aquí</p>
      </body>
    </html>
  `
});
```

**`getUnreadEmails`** - Procesar correos no leídos
```javascript
const threads = GmailApp.search('is:unread label:inbox', 0, 10);
threads.forEach(thread => {
  const messages = thread.getMessages();
  messages.forEach(message => {
    Logger.log('De: ' + message.getFrom());
    Logger.log('Asunto: ' + message.getSubject());
  });
});
```

### Registro y Depuración

**`tryCatch`** - Manejo de errores
```javascript
try {
  // Tu código aquí
} catch (error) {
  Logger.log('Error: ' + error.toString());
  // Manejar error
}
```

## Configuración

La extensión funciona sin configuración. Configuraciones opcionales:

```json
{
  "gasIntellisense.enableSnippets": true
}
```

## Requisitos

- VS Code 1.80.0 o superior
- No se requieren dependencias adicionales (no necesitas clasp ni npm en tu proyecto)

## Cómo Funciona

Esta extensión incluye las definiciones de tipos oficiales de `@types/google-apps-script` y registra archivos `.gs` con el servidor de lenguaje JavaScript de VS Code. El servidor de lenguaje TypeScript/JavaScript proporciona automáticamente IntelliSense usando estas definiciones de tipos.

**No se requiere conexión a internet** - todas las definiciones de tipos están incluidas con la extensión.

## Comparación con Otras Herramientas

| Característica | Esta Extensión | labnol/google-apps-script | Configuración manual de clasp |
|----------------|----------------|---------------------------|-------------------------------|
| IntelliSense sin configuración | ✅ | ❌ | ❌ |
| Snippets específicos de GAS | ✅ | ❌ | ❌ |
| Funciona sin conexión | ✅ | ✅ | ✅ |
| Requiere npm/clasp | ❌ | ❌ | ✅ |
| Tiempo de configuración | 0 min | 0 min | 15+ min |

## Limitaciones

Esta extensión se enfoca únicamente en **IntelliSense y edición de código**. No:

- ❌ Sincroniza código con Google Apps Script (usa [clasp](https://github.com/google/clasp) para esto)
- ❌ Ejecuta o despliega scripts (usa clasp o el editor web)
- ❌ Crea nuevos proyectos de GAS (usa clasp)

**Esto es intencional** - la extensión hace una cosa bien: mejorar tu experiencia de codificación.

## Solución de Problemas

### ¿IntelliSense no aparece?

1. Asegúrate de que el archivo tenga extensión `.gs`
2. Intenta recargar VS Code (Ctrl+Shift+P → "Developer: Reload Window")
3. Verifica que la extensión esté activada (busca "GAS IntelliSense" en la barra de estado)

### ¿Los snippets no funcionan?

1. Verifica que `gasIntellisense.enableSnippets` esté configurado como `true` (por defecto)
2. Asegúrate de estar en un contexto JavaScript (archivo .gs)
3. Escribe el prefijo del snippet y presiona Tab o Enter

### ¿Los tipos parecen desactualizados?

La extensión usa `@types/google-apps-script` v2.0.7 (última versión a octubre de 2025). Futuras actualizaciones incluirán versiones más recientes.

## Hoja de Ruta

### Fase 2 (Versión Actual)
- [x] 23 snippets de código adicionales (supera el objetivo de 15+)
- [x] Proveedor de hover personalizado con enlaces a documentación de Google
- [ ] Ayuda de firma mejorada con ejemplos
- [ ] Icono y branding de extensión

### Fase 3 (Futuro)
- [ ] Más snippets para Drive, Calendar, Forms y Documents
- [ ] Integración con clasp para push/pull
- [ ] Reglas de linter para errores comunes de GAS
- [ ] Plantillas y scaffolding de proyectos
- [ ] Generación de código con IA

## Contribuir

¡Las contribuciones son bienvenidas! Por favor siéntete libre de:

- Reportar bugs vía [GitHub Issues](https://github.com/apenara/gas-intellisense/issues)
- Enviar solicitudes de características
- Contribuir código vía Pull Requests
- Compartir tu retroalimentación

## Recursos Relacionados

- [Documentación de Google Apps Script](https://developers.google.com/apps-script)
- [clasp - Command Line Apps Script Projects](https://github.com/google/clasp)
- [@types/google-apps-script en npm](https://www.npmjs.com/package/@types/google-apps-script)

## Licencia

Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## Soporte

- **Issues:** [GitHub Issues](https://github.com/apenara/gas-intellisense/issues)
- **Discusiones:** [GitHub Discussions](https://github.com/apenara/gas-intellisense/discussions)
- **Invítame un café:** ☕ [buymeacoffee.com/apenaravan](https://buymeacoffee.com/apenaravan)

## Agradecimientos

- Construido sobre [@types/google-apps-script](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/google-apps-script) por la comunidad DefinitelyTyped
- Inspirado por la necesidad de mejores herramientas de desarrollo para Google Apps Script

---

**Hecho con ❤️ por Alfonso Peñaranda van Bommel para la comunidad de Google Apps Script**

Si esta extensión te ayuda, por favor considera:
- ⭐ Dar una estrella al repositorio
- 📝 Dejar una reseña en el marketplace
- 📢 Compartir con otros desarrolladores de GAS
- ☕ [Invítame un café](https://buymeacoffee.com/apenaravan)
