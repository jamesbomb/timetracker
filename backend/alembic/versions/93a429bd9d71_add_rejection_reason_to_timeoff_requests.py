"""add_rejection_reason_to_timeoff_requests

Revision ID: 93a429bd9d71
Revises: 07fd5048d86d
Create Date: 2025-09-08 05:58:13.781977
"""
from alembic import op
import sqlalchemy as sa

revision = '93a429bd9d71'
down_revision = '07fd5048d86d'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('timeoff_requests', sa.Column('rejection_reason', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('timeoff_requests', 'rejection_reason')
