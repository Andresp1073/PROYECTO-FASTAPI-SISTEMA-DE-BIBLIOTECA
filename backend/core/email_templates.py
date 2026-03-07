from datetime import datetime

def _base_template(title: str, content: str, footer: str = "") -> str:
    return f"""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-top: 4px solid #1e3a5f;
        }}
        .header {{
            background-color: #1e3a5f;
            color: #ffffff;
            padding: 20px 30px;
            text-align: center;
        }}
        .header h1 {{
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }}
        .header .subtitle {{
            margin: 5px 0 0;
            font-size: 14px;
            opacity: 0.9;
        }}
        .content {{
            padding: 30px;
            color: #333333;
            line-height: 1.6;
        }}
        .content h2 {{
            color: #1e3a5f;
            font-size: 18px;
            margin-top: 0;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 10px;
        }}
        .info-box {{
            background-color: #f8f9fa;
            border-left: 4px solid #1e3a5f;
            padding: 15px 20px;
            margin: 15px 0;
        }}
        .info-box strong {{
            color: #1e3a5f;
        }}
        .button {{
            display: inline-block;
            background-color: #1e3a5f;
            color: #ffffff;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 15px;
        }}
        .status-badge {{
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }}
        .status-approved {{
            background-color: #d4edda;
            color: #155724;
        }}
        .status-rejected {{
            background-color: #f8d7da;
            color: #721c24;
        }}
        .status-pending {{
            background-color: #fff3cd;
            color: #856404;
        }}
        .footer {{
            background-color: #f5f5f5;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #666666;
            border-top: 1px solid #e0e0e0;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📚 Biblioteca Académica</h1>
            <div class="subtitle">Sistema de Gestión de Préstamos</div>
        </div>
        <div class="content">
            {content}
        </div>
        <div class="footer">
            {footer if footer else f"Este es un mensaje automático del Sistema de Biblioteca. Fecha: {datetime.now().strftime('%d/%m/%Y %H:%M')}"}
        </div>
    </div>
</body>
</html>
"""


def email_nueva_solicitud_admin(libro_titulo: str, usuario_nombre: str, usuario_email: str, solicitud_id: int) -> tuple[str, str]:
    """Email para el admin cuando hay nueva solicitud de préstamo"""
    subject = f"📋 Nueva Solicitud de Préstamo - {libro_titulo}"
    
    content = f"""
    <h2>Nueva Solicitud de Préstamo</h2>
    
    <div class="info-box">
        <p><strong>Libro solicitado:</strong> {libro_titulo}</p>
        <p><strong>Solicitante:</strong> {usuario_nombre}</p>
        <p><strong>Email:</strong> {usuario_email}</p>
        <p><strong>ID de Solicitud:</strong> #{solicitud_id}</p>
    </div>
    
    <p>Se ha recibido una nueva solicitud de préstamo que requiere revisión.</p>
    
    <a href="#" class="button">Ver Solicitudes Pendientes</a>
    """
    
    return subject, _base_template(subject, content)


def email_solicitud_aprobada(libro_titulo: str, fecha_solicitud: str, solicitud_id: int) -> tuple[str, str]:
    """Email al usuario cuando su solicitud es aprobada"""
    subject = f"✅ Solicitud Aprobada - {libro_titulo}"
    
    content = f"""
    <h2>Tu Solicitud ha sido Aprobada</h2>
    
    <p>Nos complace informarte que tu solicitud de préstamo ha sido <strong>aprobada</strong>.</p>
    
    <div class="info-box">
        <p><strong>Libro:</strong> {libro_titulo}</p>
        <p><strong>Fecha de aprobación:</strong> {fecha_solicitud}</p>
        <p><strong>ID de Solicitud:</strong> #{solicitud_id}</p>
    </div>
    
    <p>📍 <strong>Instrucciones para retirar el libro:</strong></p>
    <ol>
        <li>Acude a la biblioteca con tu documento de identidad.</p>
        <li>Presenta este correo o tu ID de solicitud (#{solicitud_id}).</p>
        <li>El préstamo tiene una duración de 7 días.</p>
    </ol>
    
    <p>Gracias por utilizar nuestro servicio bibliotecario.</p>
    """
    
    return subject, _base_template(subject, content)


def email_solicitud_rechazada(libro_titulo: str, nota_rechazo: str | None, fecha_solicitud: str, solicitud_id: int) -> tuple[str, str]:
    """Email al usuario cuando su solicitud es rechazada"""
    subject = f"❌ Solicitud Rechazada - {libro_titulo}"
    
    content = f"""
    <h2>Tu Solicitud ha sido Rechazada</h2>
    
    <p>Lamentamos informarte que tu solicitud de préstamo ha sido <strong>rechazada</strong>.</p>
    
    <div class="info-box">
        <p><strong>Libro:</strong> {libro_titulo}</p>
        <p><strong>ID de Solicitud:</strong> #{solicitud_id}</p>
    """
    
    if nota_rechazo:
        content += f"""
        <p><strong>Motivo del rechazo:</strong> {nota_rechazo}</p>
        """
    
    content += f"""
    </div>
    
    <p>Si tienes alguna consulta, puedes comunicarte con el personal de la biblioteca.</p>
    
    <p>Te invitamos a explorar otros títulos disponibles en nuestro catálogo.</p>
    """
    
    return subject, _base_template(subject, content)


def email_prestamo_devuelto(libro_titulo: str, fecha_devolucion: str) -> tuple[str, str]:
    """Email al usuario cuando devuelve un libro"""
    subject = f"📗 Libro Devuelto - {libro_titulo}"
    
    content = f"""
    <h2>Confirmación de Devolución</h2>
    
    <p>Se ha registrado la devolución de tu libro.</p>
    
    <div class="info-box">
        <p><strong>Libro:</strong> {libro_titulo}</p>
        <p><strong>Fecha de devolución:</strong> {fecha_devolucion}</p>
    </div>
    
    <p>¡Gracias por devolver el libro a tiempo!</p>
    
    <p>Puedes seguir utilizando nuestros servicios bibliotecarios.</p>
    """
    
    return subject, _base_template(subject, content)
