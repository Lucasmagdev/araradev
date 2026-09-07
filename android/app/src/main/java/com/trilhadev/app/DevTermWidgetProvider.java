package com.trilhadev.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

/**
 * Widget de home screen "Termo do dia": mostra um termo de desenvolvimento +
 * significado, trocando a cada 12h. Índice calculado a partir do relógio do
 * aparelho, sem precisar salvar estado nem backend.
 */
public class DevTermWidgetProvider extends AppWidgetProvider {

    private static final long SLOT_DURATION_MILLIS = 12L * 60 * 60 * 1000;

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        String[] term = currentTerm();

        for (int appWidgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_dev_term);
            views.setTextViewText(R.id.widget_term, term[0]);
            views.setTextViewText(R.id.widget_definition, term[1]);

            Intent openApp = new Intent(context, MainActivity.class);
            PendingIntent pendingIntent = PendingIntent.getActivity(
                context,
                0,
                openApp,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            views.setOnClickPendingIntent(R.id.widget_label, pendingIntent);
            views.setOnClickPendingIntent(R.id.widget_term, pendingIntent);
            views.setOnClickPendingIntent(R.id.widget_definition, pendingIntent);

            appWidgetManager.updateAppWidget(appWidgetId, views);
        }
    }

    private static String[] currentTerm() {
        long slot = System.currentTimeMillis() / SLOT_DURATION_MILLIS;
        int index = (int) (slot % DevTerms.LIST.length);
        return DevTerms.LIST[index];
    }
}
