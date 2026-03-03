"""init

Revision ID: 0001_init
Revises:
Create Date: 2026-03-03
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0001_init"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # users
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("nombre", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("rol", sa.Enum("ADMIN", "USUARIO", name="userrol"), nullable=False, server_default="USUARIO"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("is_email_verified", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # categorias
    op.create_table(
        "categorias",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("nombre", sa.String(length=120), nullable=False),
        sa.Column("descripcion", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    )
    op.create_index("ix_categorias_nombre", "categorias", ["nombre"], unique=True)

    # libros
    op.create_table(
        "libros",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("titulo", sa.String(length=255), nullable=False),
        sa.Column("autor", sa.String(length=255), nullable=False),
        sa.Column("isbn", sa.String(length=32), nullable=False),
        sa.Column("resumen", sa.Text(), nullable=True),
        sa.Column("cover_url", sa.String(length=500), nullable=True),
        sa.Column("categoria_id", sa.Integer(), nullable=True),
        sa.Column("estado", sa.Enum("DISPONIBLE", "PRESTADO", name="libroestado"), nullable=False, server_default="DISPONIBLE"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.ForeignKeyConstraint(["categoria_id"], ["categorias.id"], name="fk_libros_categoria", ondelete="SET NULL"),
    )
    op.create_index("ix_libros_isbn", "libros", ["isbn"], unique=True)
    op.create_index("ix_libros_titulo", "libros", ["titulo"])
    op.create_index("ix_libros_autor", "libros", ["autor"])

    # auth_tokens
    op.create_table(
        "auth_tokens",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("refresh_token_hash", sa.String(length=255), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("is_revoked", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name="fk_auth_tokens_user", ondelete="CASCADE"),
    )
    op.create_index("ix_auth_tokens_refresh_token_hash", "auth_tokens", ["refresh_token_hash"])
    op.create_index("ix_auth_tokens_user_id", "auth_tokens", ["user_id"])

    # email_tokens
    op.create_table(
        "email_tokens",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("token_hash", sa.String(length=255), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column(
            "tipo",
            sa.Enum("VERIFY_EMAIL", "RESET_PASSWORD", name="emailtokentipo"),
            nullable=False,
        ),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name="fk_email_tokens_user", ondelete="CASCADE"),
    )
    op.create_index("ix_email_tokens_token_hash", "email_tokens", ["token_hash"])
    op.create_index("ix_email_tokens_user_id", "email_tokens", ["user_id"])

    # prestamos
    op.create_table(
        "prestamos",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("libro_id", sa.Integer(), nullable=False),
        sa.Column("prestado_en", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("devuelto_en", sa.DateTime(timezone=True), nullable=True),
        sa.Column("estado", sa.Enum("ACTIVO", "DEVUELTO", name="prestamoestado"), nullable=False, server_default="ACTIVO"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name="fk_prestamos_user", ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["libro_id"], ["libros.id"], name="fk_prestamos_libro", ondelete="CASCADE"),
    )
    op.create_index("ix_prestamos_user_id", "prestamos", ["user_id"])
    op.create_index("ix_prestamos_libro_id", "prestamos", ["libro_id"])


def downgrade() -> None:
    op.drop_index("ix_prestamos_libro_id", table_name="prestamos")
    op.drop_index("ix_prestamos_user_id", table_name="prestamos")
    op.drop_table("prestamos")

    op.drop_index("ix_email_tokens_user_id", table_name="email_tokens")
    op.drop_index("ix_email_tokens_token_hash", table_name="email_tokens")
    op.drop_table("email_tokens")

    op.drop_index("ix_auth_tokens_user_id", table_name="auth_tokens")
    op.drop_index("ix_auth_tokens_refresh_token_hash", table_name="auth_tokens")
    op.drop_table("auth_tokens")

    op.drop_index("ix_libros_autor", table_name="libros")
    op.drop_index("ix_libros_titulo", table_name="libros")
    op.drop_index("ix_libros_isbn", table_name="libros")
    op.drop_table("libros")

    op.drop_index("ix_categorias_nombre", table_name="categorias")
    op.drop_table("categorias")

    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")

    # limpiar enums (MySQL puede ignorar DROP TYPE; esto es seguro en otros dialectos)
    try:
        op.execute("DROP TYPE prestamoestado")
    except Exception:
        pass
    try:
        op.execute("DROP TYPE emailtokentipo")
    except Exception:
        pass
    try:
        op.execute("DROP TYPE libroestado")
    except Exception:
        pass
    try:
        op.execute("DROP TYPE userrol")
    except Exception:
        pass