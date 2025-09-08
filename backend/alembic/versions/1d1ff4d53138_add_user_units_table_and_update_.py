"""Add user_units table and update relationships

Revision ID: 1d1ff4d53138
Revises: cd47ffab6696
Create Date: 2025-09-08 05:23:18.731780
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

revision = '1d1ff4d53138'
down_revision = 'cd47ffab6696'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('user_units',
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('unit_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['unit_id'], ['units.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('user_id', 'unit_id')
    )
    
    try:
        op.drop_constraint('users_ibfk_1', 'users', type_='foreignkey')
    except:
        pass  # Constraint might not exist
    
    conn = op.get_bind()
    result = conn.execute(sa.text("SHOW COLUMNS FROM users LIKE 'unit_id'"))
    if result.fetchone():
        op.drop_column('users', 'unit_id')


def downgrade() -> None:
    op.add_column('users', sa.Column('unit_id', mysql.INTEGER(), autoincrement=False, nullable=True))
    op.create_foreign_key('users_ibfk_1', 'users', 'units', ['unit_id'], ['id'])
    op.drop_table('user_units')

