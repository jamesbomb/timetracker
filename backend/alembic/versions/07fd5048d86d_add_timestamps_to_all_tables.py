"""Add timestamps to all tables

Revision ID: 07fd5048d86d
Revises: 1d1ff4d53138
Create Date: 2025-09-08 05:41:14.739380
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import func

revision = '07fd5048d86d'
down_revision = '1d1ff4d53138'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('users', sa.Column('created_at', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('updated_at', sa.DateTime(), nullable=True))
    
    op.execute("UPDATE users SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL")
    
    op.add_column('units', sa.Column('created_at', sa.DateTime(), nullable=True))
    op.add_column('units', sa.Column('updated_at', sa.DateTime(), nullable=True))
    
    op.execute("UPDATE units SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL")
    
    op.add_column('user_units', sa.Column('created_at', sa.DateTime(), nullable=True))
    op.add_column('user_units', sa.Column('updated_at', sa.DateTime(), nullable=True))
    
    op.execute("UPDATE user_units SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL")
    
    op.add_column('manager_units', sa.Column('created_at', sa.DateTime(), nullable=True))
    op.add_column('manager_units', sa.Column('updated_at', sa.DateTime(), nullable=True))
    
    op.execute("UPDATE manager_units SET created_at = NOW(), updated_at = NOW() WHERE created_at IS NULL")


def downgrade() -> None:
    op.drop_column('manager_units', 'updated_at')
    op.drop_column('manager_units', 'created_at')
    
    op.drop_column('user_units', 'updated_at')
    op.drop_column('user_units', 'created_at')
    
    op.drop_column('units', 'updated_at')
    op.drop_column('units', 'created_at')
    
    op.drop_column('users', 'updated_at')
    op.drop_column('users', 'created_at')

