"""Initial migration

Revision ID: cd47ffab6696
Revises: 
Create Date: 2025-09-08 04:36:07.537575
"""
from alembic import op
import sqlalchemy as sa

revision = 'cd47ffab6696'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('users', sa.Column('is_superuser', sa.Boolean(), nullable=True))
    
    op.execute("UPDATE users SET is_superuser = FALSE WHERE is_superuser IS NULL")
    
    op.alter_column('users', 'is_superuser',
                    existing_type=sa.Boolean(),
                    nullable=False,
                    server_default=sa.text('0'))


def downgrade() -> None:
    op.drop_column('users', 'is_superuser')
