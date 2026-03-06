"""Signals for post-payment events."""

import logging
from typing import Any

from django.dispatch import Signal, receiver

logger = logging.getLogger('payments')

payment_successful = Signal()


def dispatch_payment_success(*, payment_transaction: Any, verification_data: dict, source: str) -> None:
    """Emit payment success signal safely without breaking request flow."""
    try:
        payment_successful.send(
            sender=payment_transaction.__class__,
            payment_transaction=payment_transaction,
            verification_data=verification_data,
            source=source,
        )
    except Exception:
        logger.exception(
            'Failed to dispatch payment_successful signal',
            extra={'reference': getattr(payment_transaction, 'reference', None), 'source': source},
        )


@receiver(payment_successful)
def log_payment_success(sender: Any, **kwargs: Any) -> None:
    """Default receiver that logs successful payment events."""
    payment_transaction = kwargs.get('payment_transaction')
    source = kwargs.get('source', 'unknown')
    logger.info(
        'Payment success signal emitted',
        extra={
            'reference': getattr(payment_transaction, 'reference', None),
            'source': source,
            'status': getattr(payment_transaction, 'status', None),
        },
    )
