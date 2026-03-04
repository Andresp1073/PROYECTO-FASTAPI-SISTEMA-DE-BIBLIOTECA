import csv
import io
from sqlalchemy.orm import Session

from models.libro import Libro, LibroEstado
from models.categoria import Categoria


def _norm_key(k: str) -> str:
    return (k or "").replace("\ufeff", "").strip().lower()


def _get(row: dict, *keys: str) -> str:
    """
    Obtiene el valor de la primera key existente (case-insensitive).
    """
    # normalizamos llaves del row
    norm_row = {_norm_key(k): v for k, v in row.items()}
    for key in keys:
        val = norm_row.get(_norm_key(key))
        if val is not None:
            return str(val).strip()
    return ""


def _sniff_dialect(sample: str) -> csv.Dialect:
    """
    Detecta delimitador (coma/;).
    """
    sniffer = csv.Sniffer()
    try:
        return sniffer.sniff(sample, delimiters=",;")
    except Exception:
        # fallback por defecto: coma
        return csv.get_dialect("excel")


def bulk_import_libros(db: Session, csv_content: str) -> dict:
    # [MODIFICADO]

    # Quitar BOM al inicio si existe
    text = (csv_content or "").lstrip("\ufeff")

    # Detectar dialecto con un sample
    sample = text[:2048]
    dialect = _sniff_dialect(sample)

    reader = csv.DictReader(io.StringIO(text), dialect=dialect)

    created = 0
    skipped = 0

    for row in reader:
        # Aceptar headers alternativos comunes
        titulo = _get(row, "titulo", "título", "title")
        autor = _get(row, "autor", "author")
        isbn = _get(row, "isbn")

        resumen = _get(row, "resumen", "summary", "descripcion", "descripción")
        categoria_nombre = _get(row, "categoria_nombre", "categoria", "category", "categoría")

        if not titulo or not autor or not isbn:
            skipped += 1
            continue

        exists = db.query(Libro).filter(Libro.isbn == isbn).first()
        if exists:
            skipped += 1
            continue

        categoria = None
        if categoria_nombre:
            categoria = db.query(Categoria).filter(Categoria.nombre == categoria_nombre).first()
            if not categoria:
                categoria = Categoria(nombre=categoria_nombre)
                db.add(categoria)
                db.flush()  # obtiene categoria.id sin commit

        libro = Libro(
            titulo=titulo,
            autor=autor,
            isbn=isbn,
            resumen=resumen or None,
            categoria_id=categoria.id if categoria else None,
            estado=LibroEstado.DISPONIBLE,
        )

        db.add(libro)
        created += 1

    db.commit()

    return {"created": created, "skipped": skipped}